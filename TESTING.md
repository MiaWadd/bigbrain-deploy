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
- The first step in this test was to create a game with two questions that the player can then play. 

## OTHER? 
- In additon to these tests we also did user tess idk something else here abot that. 
