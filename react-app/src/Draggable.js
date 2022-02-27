// code adapted from https://javascript.info/mouse-drag-and-drop

function Drag(event){

    console.log(event.target.id);
    const id = event.target.id
    var node = document.getElementById(event.target.id);
    node.style.position = 'absolute';
    node.style.cursor = 'move';

    function moveAt(pageX, pageY) {
        node.style.left = pageX - node.offsetWidth / 2 + 'px';
        node.style.top = pageY - node.offsetHeight / 2 + 'px';
        const position = [node.style.left, node.style.top];
        window.sessionStorage.setItem(id, position.toString());
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