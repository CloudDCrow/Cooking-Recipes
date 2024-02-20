// Default function to log in with Google
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth().signInWithPopup(provider)

    // After user logs in, they are send to the home page
    .then(result => {
        const user = result.user;
        window.location.href = 'home.html';
        console.log(user);
    })
    .catch(console.log);
}

document.addEventListener("DOMContentLoaded", event => {
  // Initializes Firebase app and firestore
  const app = firebase.app();
  let db = firebase.firestore();

  const submitButton = document.getElementById('submit-recipe');
  const ingredientsList = document.getElementById("ingredients-list");
  const addIngredientButton = document.getElementById("add-ingredient");
  const recipeListing = document.getElementById("recipe-listing");
  const urlParameters = new URLSearchParams(window.location.search);
  const recipeID = urlParameters.get('id');


  console.log(db);
  console.log(app);

  /* When user enters the view.html site,
  every recipe name is loaded with a hyperlink reference.
  It takes the user to the recipe.html site,
  and provides with the full information about the selected recipe.
  */
  if (window.location.pathname.includes ('/view.html')) {    
    db.collection('recipes').get()
      .then(querySnapshot => {
        const recipeNames = [];

        // Gets all recipes data
        querySnapshot.forEach(doc => {
          const recipeData = doc.data();
          console.log(doc.id, ' => ', recipeData);

          if (recipeData.name){
            recipeNames.push({ id: doc.id, name: recipeData.name });
          }
        });

        // Creates hyprelinks for each recipe from the user
        recipeNames.forEach(recipe => {
          const recipeDiv = document.createElement('div');
          recipeDiv.innerHTML = `<a href="recipe.html?id=${recipe.id}">${recipe.name}</a>`;
          recipeListing.appendChild(recipeDiv);
        });
      })
      .catch(error => {
        console.error('Error getting recipes: ', error);
      });      
  }

  // Retrieves the recipe details from Firestore
  if (recipeID) {
    db.collection('recipes').doc(recipeID).get()
      .then(doc => {
        if (doc.exists) {
          const recipeData = doc.data();
          displayRecipeDetails(recipeData);
        } else {
          console.error('No such recipe document!');
        }
      })
      .catch(error => {
        console.error('Error getting recipe details: ', error);
      });
  }

  // Displays recipes details on the page
  function displayRecipeDetails(recipeData) {
    document.getElementById('viewing-recipe-name').innerHTML = `<b>Name:</b> <br>${recipeData.name}`;
    document.getElementById('viewing-recipe-ingredients').innerHTML = `<br><b>Ingredients:</b> <br>${recipeData.ingredients.join(', ')}`;
    document.getElementById('viewing-recipe-instructions').innerHTML = `<br><b>Instructions:</b> <br>${recipeData.instructions}`;
    document.getElementById('viewing-recipe-time').innerHTML = `<br><b>Time:</b> <br>${recipeData.cookingTime} minutes`;
  }

  // Adds the option to input more ingredients
  if(addIngredientButton) {
    addIngredientButton.addEventListener("click", function () {
      const newIngredientInput = document.createElement("li");
      newIngredientInput.innerHTML = `
          <input type="text" name="ingredient" required>
          <button type="button" class="remove-ingredient">Remove</button>
      `;
      ingredientsList.appendChild(newIngredientInput);
  
      // Adds the option to remove ingredients
      const removeIngredientButtons = document.querySelectorAll(".remove-ingredient");
      removeIngredientButtons.forEach((button) => {
        button.addEventListener("click", function () {
        ingredientsList.removeChild(newIngredientInput);
        });
      });
    });
  }
  
  if(submitButton) {
    submitButton.addEventListener('click', function (event) {
      event.preventDefault();
    
      // Gets values from input fields
      const recipeName = document.getElementById('recipe-name').value;
      const ingredients = Array.from(document.querySelectorAll('#ingredients-list input')).map(input => input.value);
      const instructions = document.getElementById('instructions').value;
      const cookingTime = document.getElementById('cooking-time').value;
    
      // Creates a Firestore document with the input data
      const recipeData = {
      name: recipeName,
      ingredients: ingredients,
      instructions: instructions,
      cookingTime: cookingTime,
      };
  
      db.collection('recipes').add(recipeData)
      .then(function (docRef) {
        console.log('Recipe added with ID: ', docRef.id);
        const messageElement = document.createElement('div');
        messageElement.innerHTML = 'Recipe saved, <a href="view.html">click here</a> to view recipes';
        document.body.appendChild(messageElement);
      })
      .catch(function (error) {
        console.error('Error adding recipe: ', error);
      });
    });
  }
});