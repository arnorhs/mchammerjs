/* example usage of MCHammer */

// these items will be added to our todo list
var random_items = [
    {text: "eat zombies", done:false},
    {text: "drink the blood of the epic king", done:false},
    {text: "fuck unicorns", done:false},
    {text: "make love to a spaceship", done:false},
    {text: "remember what to do next", done:false}
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
    data.$li = $('<li data-id="'+data.id+'"><div class="done '+(data.done?"true":"")+'"></div><div class="text">'+data.text+'</div><div class="delete">Delete</div></li>');
    // when somebody checks an item as done
    $('.done',data.$li).bind('click',function(e){
        // we set the value to the opposite to what it was
        todo_list.updateItem(data.id, {done:!data.done});
        e.stopPropagation();
    });
    // when somebody clicks the delete button
    $('.delete',data.$li).bind('click',function (e) {
        todo_list.removeItem(data.id);
        e.stopPropagation();
    });
    $('ul', $todo_list).append(data.$li);
});

/*
    Built-in event that gets fired when a value is changed/updated using
    todo_list.updateItem();
    currently in this app the only thing that changes is the state of done
    from true to false, so this code reflects that. But usually you'll
    probably be updating more values, like if the text was edited, etc.
*/
todo_list.bind("MCH:updateItem", function (data, newData) {
    $('.done',data.$li).toggleClass('true', newData.done);
});

// built-in event that gets fired when an item is removed from the list using
// todo_list.removeItem();
todo_list.bind("MCH:removeItem", function (data) {
    data.$li.fadeOut(250,function(){
        data.$li.remove();
    });
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
