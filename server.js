var express = require( "express");
var path = require( "path");

// Create the express app.
var app = express();

// Define the static folder.
app.use(express.static(path.join(__dirname, "./static")));

// Setup ejs templating and define the views folder.
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// Root route to render the index.ejs view.
app.get('/', function(req, res) {
    res.render("index");
});

var server = app.listen(8000, function() {
    console.log("listening on port 8000");
});

var io = require('socket.io').listen(server);


// function createListID()

function getId(arr, element_id){
    var index = arr.findIndex(element => element.id === element_id);
    console.log("INDEX FROM GETID")
    console.log(index);
    return index;
}

// function getElement(arr, element_id){
//     index = arr;
//     var element = arr[index];
//     return element;
// }

function moveElement(arr, current_position, target_position){
    // ex. list or card that you want to move within the lists or cards array
    moving_element = arr[current_position];
    // splice to remove
    arr.splice(current_position, 1)
    // splice to insert
    arr.splice(target_position, 1, moving_element)
}
function idCreator(arr){
    id = (arr.length)+1;
    return id;
}

class Card {
    constructor(card_title, card_desc, card_list){
        this.id = idCreator(card_list);
        this.card_title = card_title;
        this.card_desc = card_desc;
    }
    showCard() {
        console.log(`Card Title: ${this.card_title}, Card Desc.: ${this.card_desc}`);
    }
}

class List {
    constructor(list_title, board_list){
        this.id = idCreator(board_list);
        this.list_title = list_title;
        this.cards = [];
    }
    createCard(card_title, card_desc){
        this.cards.push(new Card(card_title, card_desc, this.cards));
    }
    addCard(card){
        this.cards.push(card);
    }
    deleteCard(card_id){
        this.cards.splice(getId(this.cards,card_id), 1)
    }
    moveCard(card, target_position){
        let current_position = getId(this.cards, card.id)
        moveElement(this.cards, current_position, target_position);
    }
    showList(){
        console.log(`LIST id: ${this.id}, list title: ${this.list_title}, Cards in List: ${this.cards}`);
    }
}

class Board {
    constructor(board_title){
        this.id = 1; 
        this.lists = [];
    }
    createList(list_title){
        return this.lists.push(new List(list_title, this.lists));
    }
    deleteList(list_id){
        console.log(getId(this.lists,list_id))
        this.lists.splice(getId(this.lists,list_id), 1)
    }
    moveList(list, target_position){
        console.log("this lists array" + this.lists)
        console.log("this lists id:" + list.id)
        let current_position = getId(this.lists, list.id)
        console.log(current_position)
        moveElement(this.lists, current_position, target_position)
    }
    showBoard(){
        console.log(`BOARD id: ${this.id}, Lists in Board: ${this.lists}`);
        return this.list;
    }
}

var board1 = new Board("Board 1'st Title!")
board1.createList("Super Cool List Title!")
board1.createList("another list")
// board1.createList("another list3")
// board1.showBoard();

// board1.moveList(board1.lists[0],2)
board1.showBoard();
// board1.deleteList(2);

board1.lists[0].createCard("Card1's Title","card1 desc")
board1.lists[0].createCard("Card2's Title", "card2 desc")
// board1.lists[0].moveCard(board1.lists[0].cards[0], 1)
console.log(board1.lists[0].cards[0])
//board1.lists[1].addCard(board1.lists[0].cards[0])
// board1.lists[1].deleteCard(board1.lists[0].cards[0])

// console.log(board1.lists);


// var list1 = new List("Super Cool List Title!", board1.lists);
// var list2 = new List("an ok list", "this is an ok list's description");
// list1.createCard("Card1 Title", "Card1's Cool Description!");
// list1.createCard("Card2 Title", "Card2's mediocre description.");
// list1.showList();
// console.log(list1.cards);

// var card1 = new Card("Magnificent Title", "Totally magnificent Description of this card");
// card1.showCard();


io.sockets.on('connection', function(socket) {
    console.log("Client/socket is connected!");
    console.log("Client/socket id is: ", socket.id);
    
    socket.emit("display_board", {board: board1.lists});
    //console.log("This is the board we're sending to client " + {board: this.lists})

    socket.on("delete_list", function(data){
        board1.deleteList(data.list_id);
        socket.broadcast.emit("delete_list", {list_id: data.list_id})
    });

    socket.on("delete_card", function(data){
        target_list = board1.lists[data.list_id]
        board1.target_list.deleteCard(data.card_id);
        socket.broadcast.emit("delete_card", {card_id: data.card_id});
    });

    socket.on("create_list", function(data){
        console.log(data.name)
        var len = board1.createList(data.name);
        io.emit("list_added", {list_id: board1.lists[len-1]});
    });

    socket.on("create_card", function(data){
        target_list = board1.lists[data.list_id]
        target_list.createCard(data.title, data.card_desc);

        card_added = {
            list_id: data.list_id,
            card: board1.target_list.cards[data.card_id]
        }
        socket.broadcast.emit("card_added", {card_added: card_added});
    });

    // socket.on("delete_card", function(data){
        
    // });

//     socket.on("button_clicked", function (){
//         count++;

//         io.emit("broadcast_event", {count: count});
//     });

//     socket.on("reset_clicked", function (){
//         count = 0;

//         io.emit("broadcast_event", {count: count});
//     });

});