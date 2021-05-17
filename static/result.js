const container = document.querySelector('.container'),
    inner = container.querySelector(".container__image"),
    link = container.querySelector('.link'),
    xhttp = new XMLHttpRequest();
xhttp.open('POST', '/process');
xhttp.onload = function() {
    if (xhttp.status === 200) {
        // long process finished successfully
        data = JSON.parse(xhttp.responseText);
        const [r,g,b] = data.color,
            url = "data:image/png;base64," + data.img_bytes;
        inner.style.backgroundImage = `url(${url})`;
        link.style.color = `rgb(${r},${g},${b})`;
        link.addEventListener('click', ()=>{
            const a = document.createElement("a");
            a.href = url;
            a.download = "Stylized.png";
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        })
        document.body.classList.add('loaded');
        document.body.style.background = `linear-gradient(135deg,#f4f6f8, rgba(${r},${g},${b},0.25))`;
        if (matchMedia('(pointer:fine)').matches)
            tilt(container,inner);
        else
            inner.addEventListener('click',image_mouseClick);

    } else
        went_wrong();
};

xhttp.onerror = went_wrong;

xhttp.send();

function went_wrong() {
    alert('Something went wrong. \n Try again.');
    window.location = '/';
}

function image_mouseClick() {
    container.classList.add('hover');
    inner.removeEventListener('mouseenter',image_mouseClick);
}

function tilt(container,inner) {
    // Mouse
    const mouse = {
        _x: 0,
        _y: 0,
        x: 0,
        y: 0,
        updatePosition: function(event) {
            let e = event || window.event;
            this.x = -(e.clientX - this._x);
            this.y = (e.clientY - this._y);
        },
        setOrigin: function(e) {
            this._x = e.offsetLeft + Math.floor(e.offsetWidth / 2);
            this._y = e.offsetTop + Math.floor(e.offsetHeight / 2);
        },
        show: function() {
            return "(" + this.x + ", " + this.y + ")";
        }
    };

    // Track the mouse position relative to the center of the container.
    mouse.setOrigin(container);

    //-----------------------------------------

    let counter = 0;
    const updateRate = 7;
    const isTimeToUpdate = function() {
        return counter++ % updateRate === 0;
    };

    //-----------------------------------------

    inner.addEventListener('mouseenter',image_mouseEnter)

    function image_mouseEnter() {
        container.classList.add('hover');
        inner.removeEventListener('mouseenter',image_mouseEnter);
    }

    const onMouseEnterHandler = function(event) {
        update(event);
    };

    const onMouseLeaveHandler = function() {
        inner.style.transform = "";
    };

    const onMouseMoveHandler = function(event) {
        if (isTimeToUpdate()) {
            update(event);
        }
    };

    //-----------------------------------------

    const update = function(event) {
        mouse.updatePosition(event);
        updateTransformStyle(
            (mouse.y / inner.offsetHeight / 2).toFixed(2),
            (mouse.x / inner.offsetWidth / 2).toFixed(2)
        );
    };

    const updateTransformStyle = function(x, y) {
        inner.style.transform = `rotateX(${x*26}deg) rotateY(${y*13}deg)`;
    };

    //-----------------------------------------

    container.onmouseenter = onMouseEnterHandler;
    container.onmouseleave = onMouseLeaveHandler;
    container.onmousemove = onMouseMoveHandler;
}