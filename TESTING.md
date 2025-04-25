also required to write a test for another path through the program, describing the steps and the rationale behind this choice in TESTING.md, this path must contain different features than the ones described in the previous path.

# Testing Stratagy

## Componant Tests

- Componant tests were written for a majority of our componants in addition to some pages that has minimal functionaity, such as login and results. 
- Vitest was the primiary framework used for these tests. 
- The coverage flag was also added to the test script in package.json to ensure our tests coverage all the code, including standard usege and edge cases.  

## UI Tests

- UI testing utilies cypress to mock 'happy paths' of both an admin and a player.
- The cypress testing script was also added to the test script in our package.json file. 
- As cypress mimics real calls to our webpage, it requires both the frontend and backend servers to be running for the tests to run. 

### "Happy Path" of a Player

- As we have already tested a portion of the admins tasks in the required "Happy Path" of an admin tests. We decideded to test the path of a player in our second UI test. 
- The first step in this test was to create a game with two questions that the player can then play. Following this, we tested the following series of events:

1) Admin: Starts a new session
2) Player: Joins the session and is directed to the Lobby
3) Admin: Advances to the first question
4) Player: Answers the question correctly
5) Admin: Advances to the next question
6) Player: Answers the question correctly
7) Player: Changes their answer to the wrong answer
8) Admin: Ends game
9) Player: Is redirected to the results page and has one correct answer and one incorrect answer

- This test covers a significant amount of the functionaity of our webpage and ensures that players can start, play and finish a game correctly.  
- Overall, the UI tests proved incredibly valuable to ensure a coreect and functioning basic usage of our webpage. 

## Additional Testing
- In additon to UI and componant testing, we completed some user testing to ensure our platform was intuative and to test edge cases not covered by our other testing methods. 
