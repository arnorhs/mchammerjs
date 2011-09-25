/* example usage of MCHammer */


$(function(){

    init_application();

    // add a bunch of random items to the list
    var random_items = [
        {text: "eat zombies"},
        {text: "drink the blood of the epic king"},
        {text: "fuck unicorns"},
        {text: "make love to a spaceship"},
        {text: "remember what to do next"}
    ];
    for (var i = 0; i < random_items.length; i++) {
        todo_list.addItem(generate_id(), random_items[i]);
    }


});

function init_application () {

    // instantiate a new MCHammer object.. whee! first one, actually
    window.todo_list = new MCHammer();

    // some vars we'll use frequently for easy access:
    var $todo_list = $('#todo_list'),
        $controls = $('.todo-controls');

    $('input.add-text',$controls).focus();

    // Binding an event to fire each time a new item is added to the
    // item list
    todo_list.bind("MCH:addItem", function (data) {
        // the <li> item 
        // should probably be done with jquery's create object overloaded
        // functionality for cleanliness.. i just don't remember the
        // syntax off the top of my head. (NO internet, atm)
        data.$li = $('<li data-id="'+data.id+'"><div class="text">'+data.text+'</div><div class="delete">Delete</div></li>');
        $('.delete',data.$li).bind('click',function () {
            todo_list.removeItem(data.id);
        });
        $('ul', $todo_list).append(data.$li);
    });

    todo_list.bind("MCH:removeItem", function (data) {
        data.$li.fadeOut(250,function(){
            data.$li.remove();
        });
    });


    // setup events for all controls
    $('form', $controls).submit(function(){
        var $input = $('input.add-text', this);
        if ($input.val() === "") {
          return false;
        }
        todo_list.addItem(generate_id(), {
            text: $input.val()
        });
        $input.val("");
        return false;
    });

}


function generate_id () {
  return 'ID'+(Math.random()+"").replace(/\./, "");
}


