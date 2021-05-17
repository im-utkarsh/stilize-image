from io import BytesIO
from base64 import b64encode, b64decode
from re import split

import numpy as np
import tensorflow as tf
from flask import Flask, render_template, request
from PIL import Image
from requests import get

model = tf.saved_model.load('model')
app = Flask(__name__)


def unique_count_app(a):
    colors, count = np.unique(
        a.reshape(-1, a.shape[-1]), axis=0, return_counts=True)
    return colors[count.argmax()]


def crop_center(image):
    # Returns a cropped square image
    shape = image.shape
    new_shape = min(shape[1], shape[2])
    offset_y = max(shape[1] - shape[2], 0) // 2
    offset_x = max(shape[2] - shape[1], 0) // 2
    image = tf.image.crop_to_bounding_box(
        image, offset_y, offset_x, new_shape, new_shape)
    return image


# getting and preprocessing image
def img_preprocess(img_url):
    # if data uri
    if img_url[0:5] == 'data:':
        _, file_type, file_ext, _, encoded = split(
            '[:/;,]', img_url, maxsplit=4)
        if file_type == 'image' and (file_ext != 'gif' or file_ext != 'GIF'):
            # convert encoded data from url to image
            img = b64decode(encoded)
    else:
        r = get(img_url, stream=True)
        file_type, file_ext = r.headers['Content-Type'].split('/', 1)
        if r.ok and file_type == 'image' and file_ext != 'gif':
            img = r.content
        else:
            # if not valid data
            render_template('index.html')
    # convert image to numpy, normalize, handle black and white image, crop
    image = np.expand_dims(
        np.array(Image.open(BytesIO(img))).astype(np.float32), axis=0)
    if image.max() > 1.0:
        image = image / 255.
    if len(image.shape) == 3:
        image = tf.stack([image, image, image], axis=-1)
    image = crop_center(image)
    return image


def predict(style, content):
    # model prediction
    outputs = model(tf.constant(content), tf.constant(style))
    # converted to numpy and denormalized
    stylized = (outputs[0].numpy()[0]*255).astype(np.int8)
    color = unique_count_app(stylized)
    # stored in cache
    img_bytes = BytesIO()
    Image.fromarray(stylized, 'RGB').save(img_bytes, format='PNG')
    # converted to base64 then send as data url
    img_bytes = b64encode(img_bytes.getvalue()).decode("utf-8")
    return img_bytes, color


@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == 'POST':
        global style_url, content_url
        style_url = request.form['style']
        content_url = request.form['content']
        return render_template('result.html')
    return render_template("index.html")


@app.route("/process", methods=['POST'])
def process():
    if request.method == 'POST':
        style = img_preprocess(style_url)
        content = img_preprocess(content_url)
        # blurring style image for getting less content and better style
        style = tf.nn.avg_pool(style, ksize=[3, 3],
                               strides=[1, 1], padding='SAME')
        # recommended style image size is (256,256)
        style = tf.image.resize(style, (256, 256), preserve_aspect_ratio=True)
        stylized, color = predict(style, content)
        # send base64 image
        data = {
            "img_bytes": stylized,
            "color": color.tolist()
        }
        return data


if __name__ == "__main__":
    app.run()
