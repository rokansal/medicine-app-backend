import {VertexAI} from '@google-cloud/vertexai';
import { getJson } from "serpapi";


export default async function getShoppingResults(image) {
    // Instantiate the models
  const vertex_ai = new VertexAI({project: 'boxwood-plating-425605-b9', location: 'us-central1'});
  const model = 'gemini-1.5-flash-001';
  const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: model,
    generationConfig: {
      'maxOutputTokens': 8192,
      'temperature': 1,
      'topP': 0.95,
    },
  });

  let shoppingResults = {
    "medicineList" : []
  }

  let prices = []

  const image1 = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: image
    }
  };

  async function generateContent() {
    const req = {
      contents: [
        {role: 'user', parts: [image1, {text: `Extract the medicines from a prescription photo and output them in a JSON that includes names, captions, frequency, duration, and quantity for each medicine.`}]}
      ],
    };

    const streamingResp = await generativeModel.generateContentStream(req);
    let response = streamingResp.response;
    let result = (await response).candidates[0].content.parts[0].text;
    let medicineJSON = JSON.parse((result.split("``json").pop().split("```")[0]));
    let medicines = []
    for (let i = 0; i < medicineJSON.length; i++) {
      medicines.push(medicineJSON[i].name);
    }
    
    for (let j = 0; j < medicines.length; j++) {
      shoppingResults.medicineList.push({
        "medicine": medicines[j],
        "results": []
      })

    await getJson({
        api_key: "7b1bd1f838dd8efd1142caac410d44bfb53e18cc0c7570501d5c2feba60697e3",
        engine: "google_shopping",
        google_domain: "google.com",
        q: medicines[j] + " prescription medicine",
      }, (json) => {       
        for (let i = 0; i < json.shopping_results.length; i++) {
          for (let j = 0; j < json.shopping_results.length - i - 1; j++) {
            if (json.shopping_results[j].extracted_price > json.shopping_results[j + 1].extracted_price) {
              const lesser = json.shopping_results[j + 1];
              json.shopping_results[j + 1] = json.shopping_results[j];
              json.shopping_results[j] = lesser;
            }
          }
        }

        for (let i = 0; i < json.shopping_results.length; i++) {   
          //shoppingResults[j].title = json.shopping_results[i].title
          //shoppingResults.medicineList[j].results.push({
          shoppingResults.medicineList[j].results.push({
            "title": json.shopping_results[i].title,
            "price": json.shopping_results[i].extracted_price,
            "link": json.shopping_results[i].link,
          });
        }
      });
    }
    return(shoppingResults)
  }
  const results = await generateContent() 
  return(results)
}