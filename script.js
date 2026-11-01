$(document).ready(function () {

    let cardBack = "pictures/avengers.webp";
    let superheroesPictures = [
        "pictures/Batman_Vol_3_86_Textless.webp",
        "pictures/Catwoman.jpg",
        "pictures/ironman.webp",
        "pictures/spiderman.jpg",
        "pictures/the-flash.webp",
        "pictures/Wonder_Woman.webp"
    ];

    let pictures = superheroesPictures.slice();

    let firstCard = null;
    let secondCard = null;
    let hasFlippedCard = false;
    let lockBoard = false;
    let matchedPairs = 0;
    let loadingGame = false;

    function createCard(picture) {
        let card = $("<div>");
        card.addClass("memory-card");
        card.attr("data-picture", picture);

        let frontImage = $("<img>");
        frontImage.addClass("front-face");
        frontImage.attr("src", picture);

        let backImage = $("<img>");
        backImage.addClass("back-face");
        backImage.attr("src", cardBack);

        card.append(frontImage);
        card.append(backImage);

        return card;
    }

    function createGame() {
        $("#game-board").empty();

        let cards = pictures.concat(pictures);

        cards.sort(function () {
            return Math.random() - 0.5;
        });

        for (let i = 0; i < cards.length; i++) {
            $("#game-board").append(createCard(cards[i]));
        }
    }

    function flipCard() {
        if (lockBoard || loadingGame) {
            return;
        }
        if ($(this).hasClass("matched")) {
            return;
        }
        if (this === firstCard) {
            return;
        }

        $(this).addClass("flip");

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;

            $("#game-message").text("Choose your second card!");
            return;
        }

        secondCard = this;
        lockBoard = true;
        checkForMatch();
    }

    function checkForMatch() {

        let firstPicture = $(firstCard).attr("data-picture");
        let secondPicture = $(secondCard).attr("data-picture");

        if (firstPicture === secondPicture) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        $(firstCard).addClass("matched");
        $(secondCard).addClass("matched");

        matchedPairs++;

        if (matchedPairs === pictures.length) {
            $("#game-message").text("You won! All pairs matched!");
        } else {
            $("#game-message").text("It's a match! Choose another pair.");
        }

        setTimeout(function () {
            resetBoard();
        }, 500);
    }

    function unflipCards() {
        $("#game-message").text("Not a match! Remember the pictures!");

        setTimeout(function () {
            $(firstCard).removeClass("flip");
            $(secondCard).removeClass("flip");

            setTimeout(function () {
                $("#game-message").text("Choose your first card again!");
                resetBoard();
            }, 500);
        }, 1000);
    }

    function resetBoard() {
        firstCard = null;
        secondCard = null;
        hasFlippedCard = false;
        lockBoard = false;
    }

    function startNewGame(categoryName, isRandom) {
        matchedPairs = 0;
        resetBoard();
        loadingGame = false;

        $("#category-buttons button").prop("disabled", false);
        createGame();

        if (isRandom) {
            $("#game-message").text("Random selected " + categoryName + "! Find all pairs!");
        } else {
            $("#game-message").text(categoryName + " selected! Find all pairs!");
        }
    }

    function showLoadError(categoryName) {
        loadingGame = false;
        $("#category-buttons button").prop("disabled", false);
        $("#game-message").text("couldn't load " + categoryName + ". Please try again!");
    }

    function loadCategory(category, isRandom) {
        if (lockBoard || loadingGame) {
            return;
        }

        loadingGame = true;
        $("#category-buttons button").prop("disabled", true);

        let categoryName = "";

        if (category === "harry-potter") {
            categoryName = "Harry Potter"
        } else if (category === "dogs") {
            categoryName = "Dogs"
        } else {
            categoryName = "Superheroes";
        }

        $("#game-message").text("Loading " + categoryName + " pictures...");

        if (category === "superheroes") {
            pictures = superheroesPictures.slice();
            startNewGame(categoryName, isRandom);
        }
        else if (category === "harry-potter") {
            $.ajax({
                type: "GET",
                url: "https://hp-api.onrender.com/api/characters",
                dataType: "json",
                timeout: 10000,

                success: function (data) {

                    let characters = data.filter(function (character) {
                        return character.image && character.image.trim() !== "";
                    });

                    characters.sort(function () {
                        return Math.random() - 0.5;
                    });
                    if (characters.length < 6) {
                        showLoadError(categoryName);
                        return;
                    }

                    pictures = characters.slice(0, 6).map(function (character) {
                        return character.image;
                    });

                    startNewGame(categoryName, isRandom);
                },

                error: function () {
                    showLoadError(categoryName);
                }
            });
        }
        else if (category === "dogs") {
            $.ajax({
                type: "GET",
                url: "https://dog.ceo/api/breeds/image/random/6",
                dataType: "json",
                timeout: 10000,

                success: function (data) {
                    if (data.status !== "success") {
                        showLoadError(categoryName);
                        return;
                    }

                    let dogPictures = data.message.filter(
                        function (picture, index, allPictures) {
                            return allPictures.indexOf(picture) === index;
                        }
                    );

                    if (dogPictures.length < 6) {
                        showLoadError(categoryName);
                        return;
                    }

                    dogPictures.sort(function () {
                        return Math.random() - 0.5;
                    });

                    pictures = dogPictures.slice(0, 6);

                    startNewGame(categoryName, isRandom);
                },

                error: function () {
                    showLoadError(categoryName);
                }
            });
        }
    }

    $("#harry-potter").on("click", function () {
        loadCategory("harry-potter", false);
    });
    $("#dogs").on("click", function () {
        loadCategory("dogs", false);
    });
    $("#superheroes").on("click", function () {
        loadCategory("superheroes", false);
    });
    $("#random").on("click", function () {

        let categories = ["harry-potter", "dogs", "superheroes"];
        let randomCategory = categories[Math.floor(Math.random() * categories.length)];

        loadCategory(randomCategory, true);
    });
    createGame();

    $("#game-board").on("click", ".memory-card", flipCard);
})