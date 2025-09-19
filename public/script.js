const URL = "./models/";
let model, maxPredictions;

async function init() {
  try {
    // Check if tmImage is available
    if (typeof tmImage === 'undefined') {
      throw new Error('Teachable Machine library not loaded. Please refresh the page.');
    }

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Error loading model:', error);
    document.getElementById("prediction").innerText = "Error loading model: " + error.message;
    throw error;
  }
}

async function predict() {
  try {
    if (!model) await init();

    const image = document.createElement("img");
    image.src = "./sample.jpg"; // Replace with webcam or file input

    // Wait for image to load
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const prediction = await model.predict(image);
    prediction.sort((a, b) => b.probability - a.probability);
    const best = prediction[0].className;

    document.getElementById("prediction").innerText = "Prediction: " + best;

    // Send to backend
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prediction: best }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Server error: ${errorData.error} - ${errorData.details || ''}`);
    }

    const data = await response.json();
    console.log('Received data from server:', data);
    
    const geminiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
