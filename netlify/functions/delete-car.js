exports.handler = async (event, context) => {
  console.log("Delete car function started");
  
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
    
    // Parse the request body to get the car ID
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing request body" })
      };
    }
    
    const { id } = JSON.parse(event.body);
    
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Car ID is required" })
      };
    }
    
    console.log(`Attempting to delete submission with ID: ${id}`);
    
    // Delete the submission using the Netlify API
    const deleteResponse = await fetch(`https://api.netlify.com/api/v1/submissions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`Netlify API responded with ${deleteResponse.status}: ${errorText}`);
    }
    
    console.log(`Successfully deleted submission with ID: ${id}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: "Car deleted successfully" 
      })
    };
  } catch (error) {
    console.error('Error in delete-car function:', error);
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