# stilize-image

## Introduction
The web app takes style and content image as input via upload or link and generates a stylized image using **tensorflow** pretrained style transfer model.

## Requirements
> Flask==1.1.2  
> numpy==1.19.2  
> Pillow==8.2.0  
> requests==2.25.1  
> tensorflow==2.4.1   

All other dependencies will be installed automatically.

## Description
Flask is used for devloping this web application.
As soon as the "POST" request is made,the image urls (or data urls in case of uploaded images) are send to backend server where they are stored in global variables so they can 
be accessed in other functions. The url images are loaded in cache using requests.get method while uploaded images are decoded back from base64 data urls. 
The images are then converted to pillow Image object followed by conversion to numpy.  
```python
image = Image.open(BytesIO(img))
image = np.array(image).astype(np.float32)
```
After this the images are preprocessed and loaded in tensorflow model.  
The output image is then converted to base64 data url and send to front-end.

## Test Locally
* Fork the project
* Create virtual environment and install requirements
* In project directory, run `python app.py`
* Web app is live at localhost:5000

## Deployment
The deployment is done on heroku using gunicorn.  
Please note the deployment is done using tensorflow-cpu and tensorflow-hub due to heroku slug limit (500MB). The app may not perform well due to the same memory limit.
