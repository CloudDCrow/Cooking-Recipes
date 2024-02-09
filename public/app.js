// Default function to log in with Google
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth().signInWithPopup(provider)

    //After user logs in, they are send to the home page
    .then(result => {
        const user = result.user;
        window.location.href = 'home.html';
        console.log(user);
    })
    .catch(console.log);
}

document.addEventListener("DOMContentLoaded", event => {
  const app = firebase.app();

  const submitButton = document.getElementById('submit-recipe');
  const ingredientsList = document.getElementById("ingredients-list");
  const addIngredientButton = document.getElementById("add-ingredient");
  const recipeListing = document.getElementById("recipe-listing");
  const urlParameters = new URLSearchParams(window.location.search);
  const recipeID = urlParameters.get('id');

  let db = firebase.firestore();

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
        querySnapshot.forEach(doc => {
          const recipeData = doc.data();
          console.log(doc.id, ' => ', recipeData);

          if (recipeData.name){
            recipeNames.push({ id: doc.id, name: recipeData.name });
          }
        });

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

  function displayRecipeDetails(recipeData) {
    // Displays recipes details on the page
    document.getElementById('viewing-recipe-name').textContent = `Name: ${recipeData.name}`;
    document.getElementById('viewing-recipe-ingredients').textContent = `Ingredients: ${recipeData.ingredients.join(', ')}`;
    document.getElementById('viewing-recipe-instructions').textContent = `Instructions: ${recipeData.instructions}`;
    document.getElementById('viewing-recipe-time').textContent = `Time: ${recipeData.cookingTime} minutes`;
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
        })
        .catch(function (error) {
          console.error('Error adding recipe: ', error);
        });
    
      console.log('Recipe Name:', recipeName);
      console.log('Ingredients:', ingredients);
      console.log('Instructions:', instructions);
      console.log('Cooking Time:', cookingTime);
    });
  }
});
