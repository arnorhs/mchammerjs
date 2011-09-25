/* example usage of MCHammer - a fucking table */


$(function(){

    init_application();

    // add a bunch of random items to the list
    var random_items = [
        {
          title: "eat zombies",
          author: "John Hobbes",
          publisher: "Dream pub",
          year: "1984"
        },
        {
          title: "eat things",
          author: "John Hobbes",
          publisher: "Dream pub",
          year: "1985"
        },
        {
          title: "eat zombies II",
          author: "John Hobbes",
          publisher: "Alternative publishing",
          year: "1989"
        },
        {
          title: "My last book",
          author: "John Hobbes",
          publisher: "New media",
          year: "1994"
        },
        {
          title: "Women like it rough",
          author: "Rebecca Baldwin",
          publisher: "Dream pub",
          year: "1992"
        },
        {
          title: "I don't have a man, what now?",
          author: "Rebecca Baldwin",
          publisher: "Dream pub",
          year: "1994"
        },
        {
          title: "Akward awakening",
          author: "William Buroughs",
          publisher: "New media",
          year: "2000"
        },
        {
          title: "Sexy on the balcony",
          author: "Billy Crossroads",
          publisher: "Love publishing",
          year: "1995"
        },
        {
          title: "Every color of love",
          author: "Billy Crossroads",
          publisher: "Love publishing",
          year: "1995"
        },
        {
          title: "The man on the bridge",
          author: "Billy Crossroads",
          publisher: "Love publishing",
          year: "1996"
        },
        {
          title: "Love happened",
          author: "Billy Crossroads",
          publisher: "Dream pub",
          year: "1997"
        },
        {
          title: "When love strikes",
          author: "Billy Crossroads",
          publisher: "Dream pub",
          year: "1997"
        },
        {
          title: "Nice day for a romance",
          author: "Billy Crossroads",
          publisher: "Love publishing",
          year: "1997"
        },
        {
          title: "Through the heart",
          author: "Billy Crossroads",
          publisher: "Love publishing",
          year: "1998"
        }
    ];
    for (var i = 0; i < random_items.length; i++) {
        books.addItem(generate_id(), random_items[i]);
    }

});

function init_application () {

    // instantiate a new MCHammer object.. whee! first one, actually
    window.books = new MCHammer();

    // some vars we'll use frequently for easy access:
    var $table = $('#our_table');

    // Binding an event to fire each time a new item is added to the
    // item list
    books.bind("MCH:addItem", function (data) {

        // add our table row
        data.$tr = $('<tr data-id="'+data.id+'"><td data-field="title">'+data.title+'</td><td data-field="author">'+data.author+'</td><td data-field="publisher">'+data.publisher+'</td><td data-field="year">'+data.year+'</td></tr>');

        $('td',data.$tr).bind('click',function(e){
            books.trigger(data.id, "filterByAttribute", $(this).attr("data-field"));
        });
        $('tbody', $table).append(data.$tr);
    });

    books.bind("filterByAttribute", function (data, field) {

        $('.filter-indicator')
            .addClass('active')
            .show()
            .html('Filtering by <span class="attribute">'+field+'</span>: <span class="value">'+data[field]+'</span><a href="#" class="remove">x</a>')
            .find('.remove')
            .bind('click',function(){
                $('tr',$table).show();
                $(this).closest('.filter-indicator').removeClass('active').hide();
            });

        for (var id in books.items) {
            var f = books.items[id];
            if (f[field] != data[field]) {
                f.$tr.hide();
            } else {
                f.$tr.show();
            }
        }
    });

    books.bind("MCH:updateItem", function (data, newData) {
        // possibly do something?
    });


}


function generate_id () {
  return 'ID'+(Math.random()+"").replace(/\./, "");
}


