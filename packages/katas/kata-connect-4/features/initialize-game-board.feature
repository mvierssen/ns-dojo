Feature: Initialize Game Board
  As a game player
  I want to start a new game with a clean board
  So that I can begin playing Connect 4

  Scenario: New game board initializes with all empty positions
    Given the game is started
    When the board is initialized
    Then the board displays 6 rows and 7 columns
    And all 42 positions show empty spaces
    And columns are labeled 1 through 7 (left to right)
    And rows are labeled 1 through 6 (bottom to top)
    And all 42 positions are available for coin placement
