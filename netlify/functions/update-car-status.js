exports.handler = async (event, context) => {
  console.log("Update car status function started");
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }
  
  // Check if method is POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    // Initialize the API variables
    const token = process.env.NETLIFY_API_TOKEN;
    const siteId = process.env.NETLIFY_SITE_ID;
    
    if (!token || !siteId) {
      console.error("Missing environment variables");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: "Missing required environment variables. Please set NETLIFY_API_TOKEN and NETLIFY_SITE_ID." 
        })
      };
    }
    
    // Parse the request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing request body" })
      };
    }
    
    const { id, isSold } = JSON.parse(event.body);
    
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Car ID is required" })
      };
    }
    
    if (isSold === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "isSold status is required" })
      };
    }
    
    console.log(`Attempting to update car ${id} status to ${isSold ? 'sold' : 'available'}`);
    
    // First, get the car's current data
    const carResponse = await fetch(`https://api.netlify.com/api/v1/submissions/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!carResponse.ok) {
      const errorText = await carResponse.text();
      throw new Error(`Netlify API responded with ${carResponse.status}: ${errorText}`);
    }
    
    const carData = await carResponse.json();
    console.log(`Retrieved car data for ${id}`);
    
    // Update the isSold property in the car data
    const updatedData = {
      ...carData.data,
      isSold: isSold.toString() // Netlify form data is typically stored as strings
    };
    
    // Update the submission
    const updateResponse = await fetch(`https://api.netlify.com/api/v1/submissions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: updatedData
      })
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Netlify API responded with ${updateResponse.status}: ${errorText}`);
    }
    
    console.log(`Successfully updated car ${id} status to ${isSold ? 'sold' : 'available'}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: `Car marked as ${isSold ? 'sold' : 'available'} successfully` 
      })
    };
  } catch (error) {
    console.error('Error in update-car-status function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: error.message
      })
    };
  }
};