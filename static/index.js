const contentImgButton = document.getElementById('contentImg');
const styleImgButton = document.getElementById('styleImg');
const container = document.getElementById('container');
const inputs = document.querySelectorAll('.container input');
const generate = document.querySelector('form .btn');
const overlay = document.querySelector('.overlay');
const mediaQuery = window.matchMedia( '( min-device-width: 540px )' );

contentImgButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

styleImgButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

inputs.forEach(function(element) {
    element.addEventListener('change',img_change);
});

function img_change(e){
    let elem = e.target;
    let img_type = overlay.querySelector('#'+elem.className);
    let img = overlay.querySelector('img.'+elem.className);

    if (elem.type == 'url'){
        let url = elem.value;
        if (url.length){
            if (mediaQuery.matches)
                img_type.style.backgroundImage = `linear-gradient(to right, #ff4b2b99, #ff416c99), url(${url})`;
            else
                img_type.style.background = `initial`;
            img.src = url;
        }
    }
    else if (elem.type == 'file'){
        let reader = new FileReader();
        reader.onload = function() {
            if (mediaQuery.matches)
                img_type.style.backgroundImage = `linear-gradient(to right, #ff4b2b99, #ff416c99), url(${reader.result})`;
            else
                img_type.style.background = `initial`;
            img.src = reader.result;
            elem.nextElementSibling.innerHTML = 'Selected 1 file' ;
        }
        reader.readAsDataURL(elem.files[0]);
    } else
        alert('Inalid data!');
}

generate.addEventListener('click',()=>{
    let imgs = overlay.querySelectorAll('img');
    let submit_inputs = document.querySelectorAll('form input');
    for (var i = 0; i < 2; i++) {
        submit_inputs[i].value = imgs[1-i].src;
    }
    generate.classList.add('clicked');
    setTimeout("submitForm()", Math.floor(750+Math.random()*1500));
});

function submitForm() { // submits form
    document.querySelector("form").submit();
}