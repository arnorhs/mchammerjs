/* example usage of MCHammer */

// these items will be added to our todo list
var random_items = [
    {text: "eat zombies"},
    {text: "drink the blood of the epic king"},
    {text: "fuck unicorns"},
    {text: "make love to a spaceship"},
    {text: "remember what to do next"}
];

// instantiate a new MCHammer object.. whee! first one, actually
window.todo_list = new MCHammer();

/*
    Binding an event to fire each time a new item is added to the
    item list
    This is a built-in event and gets triggered by MCHammer
    automatically, so you don't have to manually trigger it
    yourself.
*/
todo_list.bind("MCH:addItem", function (data) {
    /*
        the <li> item 
        should probably be done with jquery's create object overloaded
        functionality for cleanliness.. i just don't remember the
        syntax off the top of my head. (NO internet, atm)
    */
    data.$li = $('<li data-id="'+data.id+'"><div class="text">'+data.text+'</div><div class="delete">Delete</div></li>');
    $('.delete',data.$li).bind('click',function (e) {
        todo_list.removeItem(data.id);
        e.stopPropagation();
    });
    // When a list item is clicked - this is just for demo purposes, don't know
    // why you'd actually want to do that
    data.$li.bind('click',function(e){
        // just update somehow.. don't care at this point it's already 2:18 am
        todo_list.updateItem(data.id, {text:data.text+' with update'});
    });
    $('ul', $todo_list).append(data.$li);
});

todo_list.bind("MCH:removeItem", function (data) {
    data.$li.fadeOut(250,function(){
        data.$li.remove();
    });
});

todo_list.bind("MCH:updateItem", function (data, newData) {
    $('.text',data.$li).html(data.text);
});

// helper function to generate an ID for item that gets added
// There is no actual need to remove that dot from the number, it's
// just a matter of aesthetic preferences
function generate_id () {
  return 'ID'+(Math.random()+"").replace(/\./, "");
}

// on ready event - fires when the document is ready.
$(function(){
    // some vars we'll use frequently for easy access:
    window.$todo_list = $('#todo_list');
    window.$controls = $('.todo-controls');

    // walk through the list of items we generated before and add
    // each one to the object
    for (var i = 0; i < random_items.length; i++) {
        todo_list.addItem(generate_id(), random_items[i]);
    }

    // setup event for saving the text that was typed in
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

    // Focus the text box
    $('input.add-text',$controls).focus();

});
