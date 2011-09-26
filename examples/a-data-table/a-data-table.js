/*
   example usage of MCHammer - a data table

   This app simply lists a bunch of books and some info on them and allows
   the user to click any cell to filter by the value in that cell.
*/


/* This is the data we'll want to load - in a production environment these might come
   from either an ajax request or loaded with the document: */
var list_of_books = [
    { title: "eat zombies", author: "John Hobbes", publisher: "Dream pub", year: "1984" },
    { title: "eat things", author: "John Hobbes", publisher: "Dream pub", year: "1985" },
    { title: "eat zombies II", author: "John Hobbes", publisher: "Alternative publishing", year: "1989" },
    { title: "My last book", author: "John Hobbes", publisher: "New media", year: "1994" },
    { title: "Women like it rough", author: "Rebecca Baldwin", publisher: "Dream pub", year: "1992" },
    { title: "I don't have a man, what now?", author: "Rebecca Baldwin", publisher: "Dream pub", year: "1994" },
    { title: "Akward awakening", author: "William Buroughs", publisher: "New media", year: "2000" },
    { title: "Sexy on the balcony", author: "Billy Crossroads", publisher: "Love publishing", year: "1995" },
    { title: "Every color of love", author: "Billy Crossroads", publisher: "Love publishing", year: "1995" },
    { title: "The man on the bridge", author: "Billy Crossroads", publisher: "Love publishing", year: "1996" },
    { title: "Love happened", author: "Billy Crossroads", publisher: "Dream pub", year: "1997" },
    { title: "When love strikes", author: "Billy Crossroads", publisher: "Dream pub", year: "1997" },
    { title: "Nice day for a romance", author: "Billy Crossroads", publisher: "Love publishing", year: "1997" },
    { title: "Through the heart", author: "Billy Crossroads", publisher: "Love publishing", year: "1998" }
];

// instantiate a new MCHammer object for books - add it to window to make sure it's global..
window.books = new MCHammer();

/*
    Binding an event to fire each time a new item is added to the
    item list. Here the events are set to the element as well, so
    if we were to add something dynamically, it would be trivial to
    do so.

    This is a built-in event, so you don't have to trigger it.
*/
books.bind("MCH:addItem", function (data) {
    // add our table row
    data.$tr = $('<tr data-id="'+data.id+'"><td data-field="title">'+data.title+'</td><td data-field="author">'+data.author+'</td><td data-field="publisher">'+data.publisher+'</td><td data-field="year">'+data.year+'</td></tr>');

    // Bind an event to when a cell is clicked
    $('td',data.$tr).bind('click',function(e){
        books.trigger(data.id, "filterByAttribute", $(this).attr("data-field"));
    });
    $('td',data.$tr).bind('click',function(e){
        if (!!e.metaKey) {
        }
    });
    $('tbody', $table).append(data.$tr);
});

// Event that gets fired when "filterByAttribute" gets triggered - or more
// appropriately - when a cell is clicked
books.bind("filterByAttribute", function (data, field) {
    /*
        Activate the .filter-indicator container. This is where the text message
        appears when you've clicked on a cell.

        Also add a clear button to clear it and a handler that does the work
    */
    $('.filter-indicator')
        .addClass('active')
        .show()
        .html('Filtering by <span class="attribute">'+field+'</span>: <span class="value">'+data[field]+'</span><a href="#" class="clear">x</a>')
        .find('.clear')
        .bind('click',function(){
            $('tr',$table).show();
            $(this).closest('.filter-indicator').removeClass('active').hide();
            return false;
        });

    /*
        Iterate through all the items in the object and hide or show each row
        if it fits or does not fit within the filtered value
    */
    for (var id in books.items) {
        var f = books.items[id];
        if (f[field] != data[field]) {
            f.$tr.hide();
        } else {
            f.$tr.show();
        }
    }
});

// a helper function to generate an ID for each book that gets added
function generate_id () {
  return 'ID'+(Math.random()+"").replace(/\./, "");
}

// on ready event - fires when the DOM is ready.
$(function(){
    // This is the main container that wraps the table element
    // We'll be referencing it a lot, so good to have it handy
    window.$table = $('div#our_table');

    // Add these items to the mchammer object.
    for (var i = 0; i < list_of_books.length; i++) {
        books.addItem(generate_id(), list_of_books[i]);
    }
});


