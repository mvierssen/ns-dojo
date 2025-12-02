Feature: Provide Clear Game Instructions
  As a new player
  I want to understand the rules and how to play when I start the game
  So that I can begin playing without external help

  Scenario: Game displays instructions on startup and player can proceed
    Given the application is launched
    When the game starts
    Then a welcome message and basic rules are displayed
    And the rules explain board is 6 rows by 7 columns
    And the rules explain coins are dropped and fall to the lowest row
    And the rules explain Player 1 goes first, then players alternate
    And the rules explain 4-in-a-row (horizontal, vertical, or diagonal) wins
    And the rules explain a draw occurs when board is full with no winner
    And the rules clarify columns 1 through 7 are used for selection
    And the player is prompted to press a key to start the game
    And upon pressing that key, the game begins with a fresh board
