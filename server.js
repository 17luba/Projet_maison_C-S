const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');

require("dotenv").config()
const apli = express();
const port = process.env.PORT;

// Middleware pour parser le corps des requêtes HTTP
apli.use(bodyParser.urlencoded({ extended: true }));

// Route pour gérer les requêtes vers l'API de ChatGPT
// Configuration de body-parser pour traiter les données du formulaire
apli.use(bodyParser.urlencoded({ extended: true }));

apli.post('/requette', async (req, res) => {
  const { nom, prenom, email, recherche } = req.body;

  // Enregistre les données dans un fichier JSON
  const data = {
  nom,
  prenom,
  email,
  recherche,
  };
  fs.writeFile('data.json', JSON.stringify(data), (err) => {
  if (err) {
    console.error(err);
    res.status(500).send('Erreur lors de l\'enregistrement des données.');
  } else {
    // Appelle la fonction pour communiquer avec l'API ChatGPT
    chatGPTResponse(recherche)
    .then((response) => {
      // Enregistre la réponse dans le fichier JSON
      data.reponseChatGPT = response;
      fs.writeFile('data.json', JSON.stringify(data), (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Erreur lors de l\'enregistrement de la réponse ChatGPT.');
        } else {
            res.status(200).send('Données enregistrées avec succès.');
        }
      });
    })
    .catch((error) => {
    console.error(error);
    res.status(500).send('Erreur lors de la communication avec l\'API ChatGPT.');
    });
  }
  });
 }
 )
 
 const chatGPTResponse = async (texteRecherche) => {
  try {
  // Utilisation de la clé d'API de ChatGPT
  const apiKey = process.env.KEY;
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: texteRecherche },
      ],
  }, {
  headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
  },
  });
 
  return response.data.choices[0].message.content;
  } catch (error) {
  throw error;
  }
};
 

// Définition de la route pour la méthode GET
apli.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

// Définition de la route pour la méthode POST (traitement du formulaire)
apli.post('/submit', (req, res) => {
    const formData = req.body; // Les données du formulaire sont disponibles dans req.body
    // Répondez à la demande avec un message de confirmation
  res.send('Formulaire soumis avec succès!');
});

// route pour afficher le formulaire
apli.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Route de traitement des données
apli.post('/', (req, res) => {
  const { nom, prenom, email, recherche } = req.body;

  // Enregistrement dans un fichier JSON
  const formData = { nom, prenom, email, recherche };
  const jsonData = JSON.stringify(formData, null, 2);
  const filePath = 'reponse.json';

  fs.writeFile(filePath, jsonData, 'utf8', (err) => {
     if (err) {
        console.error('Erreur lors de l\'enregistrement dans le fichier JSON:', err);
        res.status(500).send('Erreur lors de l\'enregistrement dans le fichier JSON');
     } else {
        console.log('Données enregistrées avec succès dans le fichier JSON.');

        // Appel de l'API de ChatGPT avec Axios
        const apiKey = process.env.CHATGPT_API_KEY;
        const chatGptEndpoint = 'https://platform.openai.com/api-keys';

        axios.post(chatGptEndpoint, {
           messages: [{ role: 'user', content: recherche }],
        }, {
           headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
           },
        })
        .then(response => {
           const chatGptResponse = response.data.choices[0].message.content;

           // Enregistrement de la réponse dans le fichier JSON (à implémenter)
        })
        .catch(error => {
           console.error('Erreur de l\'API ChatGPT:', error.response.data);
           res.status(500).send('Erreur de l\'API ChatGPT');
        });
     }
  });
});

// Démarrage du serveur
apli.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
