// when the DOM has fully loaded.
$(document).ready(function() {

  // create a characters object to hold our characters.
  var characters = {
    "Obi-Wan Kenobi": {
      name: "Obi-Wan Kenobi",
      health: 120,
      attack: 8,
      imageUrl: "assets/images/obi-wan.jpg",
      enemyAttackBack: 15
    },
    "Luke Skywalker": {
      name: "Luke Skywalker",
      health: 100,
      attack: 14,
      imageUrl: "assets/images/luke-skywalker.jpg",
      enemyAttackBack: 5
    },
    "Darth Sidious": {
      name: "Darth Sidious",
      health: 150,
      attack: 8,
      imageUrl: "assets/images/darth-sidious.png",
      enemyAttackBack: 20
    },
    "Darth Maul": {
      name: "Darth Maul",
      health: 180,
      attack: 7,
      imageUrl: "assets/images/darth-maul.jpg",
      enemyAttackBack: 25
    }
  };

  // attacker will be populated when the player selects a character.
  var attacker;
  // all the characters the player didn't select.
  var combatants = [];
  // populated when the player chooses an opponent.
  var defender;
  // keeps track of turns during combat. also used for calculating player damage.
  var turnCounter = 1;
  // tracks number of defeated opponents.
  var killCount = 0;

  // ===================================================================

  // function renders a character card to the page.
  // the character rendered, the area they are rendered to, and their status is determined by the arguments passed in.
  var renderCharacter = function(character, renderArea) {
    // This block of code builds the character card, and renders it to the page.
    var charDiv = $("<div class='character' data-name='" + character.name + "'>");
    var charName = $("<div class='character-name'>").text(character.name);
    var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
    var charHealth = $("<div class='character-health'>").text(character.health);
    charDiv.append(charName).append(charImage).append(charHealth);
    $(renderArea).append(charDiv);
  };

  // function will load all the characters into the character section to be selected
  var initializeGame = function() {
    // loop through the characters object and call the renderCharacter function on each character to render their card.
    for (var key in characters) {
      renderCharacter(characters[key], "#characters-section");
    }
  };

  // run the function here...
  initializeGame();

  // function handles updating the selected player or the current defender - if there is no selected player/defender this
  // function will also place the character based on the areaRender chosen (e.g. #selected-character or #defender)
  var updateCharacter = function(charObj, areaRender) {
    // first empty the area 
    $(areaRender).empty();
    // re-render the new object
    renderCharacter(charObj, areaRender);
  };

  // function to render the available-to-attack enemies. run once, after a character has been selected
  var renderEnemies = function(enemyArr) {
    for (var i = 0; i < enemyArr.length; i++) {
      renderCharacter(enemyArr[i], "#available-to-attack-section");
    }
  };

  // function for rendering game messages.
  var renderMessage = function(message) {
    
    var gameMessageSet = $("#game-message");
    var newMessage = $("<div>").text(message);
    gameMessageSet.append(newMessage);
  };

  // unction to handle restarting the game 
  var restartGame = function(resultMessage) {
    // when the 'Restart' button is clicked, reload the page.
    var restart = $("<button>Restart</button>").click(function() {
      location.reload();
    });

    // div to display the victory/defeat message.
    var gameState = $("<div>").text(resultMessage);

    // render the restart button and victory/defeat message to the page.
    $("body").append(gameState);
    $("body").append(restart);
  };

  // clear the game message section
  var clearMessage = function() {
    var gameMessage = $("#game-message");

    gameMessage.text("");
  };

  // ===================================================================

  // On click for selecting our character.
  $("#characters-section").on("click", ".character", function() {
    // save the clicked character's name.
    var name = $(this).attr("data-name");

    // if a player character hasn't been chosen...
    if (!attacker) {
      // populate attacker with the selected character's information.
      attacker = characters[name];
      // then loop through the remaining characters and push them to the combatants array.
      for (var key in characters) {
        if (key !== name) {
          combatants.push(characters[key]);
        }
      }

      // hide the character select div.
      $("#characters-section").hide();

      // render our selected character and our combatants.
      updateCharacter(attacker, "#selected-character");
      renderEnemies(combatants);
    }
  });

  // creates an on click event for each enemy.
  $("#available-to-attack-section").on("click", ".character", function() {
    // save the opponent's name.
    var name = $(this).attr("data-name");

    // if there is no defender, the clicked enemy becomes the defender.
    if ($("#defender").children().length === 0) {
      defender = characters[name];
      updateCharacter(defender, "#defender");

      // remove element as it will now be a new defender
      $(this).remove();
      clearMessage();
    }
  });

  // on-click for the attack button, run the following game logic...
  $("#attack-button").on("click", function() {
    // if there is a defender, combat will occur.
    if ($("#defender").children().length !== 0) {
      // messages for our attack and our opponents counter attack.
      var attackMessage = "You attacked " + defender.name + " for " + attacker.attack * turnCounter + " damage.";
      var counterAttackMessage = defender.name + " attacked you back for " + defender.enemyAttackBack + " damage.";
      clearMessage();

      // reduce defender's health by your attack value.
      defender.health -= attacker.attack * turnCounter;

      // if the enemy still has health..
      if (defender.health > 0) {
        // render the enemy's updated character card.
        updateCharacter(defender, "#defender");

        // render the combat messages.
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);

        // reduce your health by the opponent's attack value.
        attacker.health -= defender.enemyAttackBack;

        // render the player's updated character card.
        updateCharacter(attacker, "#selected-character");

        // if player has less than zero health the game ends.
        // call the restartGame function to allow the user to restart the game and play again.
        if (attacker.health <= 0) {
          clearMessage();
          restartGame("You have been defeated...GAME OVER!!!");
          $("#attack-button").off("click");
        }
      }
      else {
        // if the enemy has less than zero health they are defeated.
        // remove opponent's character card.
        $("#defender").empty();

        var gameStateMessage = "You have defeated " + defender.name + ", you can choose to fight another enemy.";
        renderMessage(gameStateMessage);

        // increment kill count.
        killCount++;

        // if you killed all opponents you win.
        // call restartGame function to restart the game and play again.
        if (killCount >= combatants.length) {
          clearMessage();
          $("#attack-button").off("click");
          restartGame("You Won!!!! GAME OVER!!!");
        }
      }
      // increment turn counter - used for determining how much damage the player does.
      turnCounter++;
    }
    else {
      // if there is no defender, render an error message.
      clearMessage();
      renderMessage("No enemy here.");
    }
  });
});
