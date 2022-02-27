// code adapted from https://javascript.info/mouse-drag-and-drop

function Drag(event){

    console.log(event.target.id);
    var node = document.getElementById(event.target.id);
    node.style.cursor = 'move';

    function moveAt(pageX, pageY) {
        node.style.left = pageX - node.offsetWidth / 2 + 'px';
        node.style.top = pageY - node.offsetHeight / 2 + 'px';
    }

    moveAt(event.pageX, event.pageY);

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', function(){
        document.removeEventListener('mousemove', onMouseMove); node.style.cursor = 'pointer';});

    node.ondragstart = function() {
        return false;
    };
}

export{Drag};