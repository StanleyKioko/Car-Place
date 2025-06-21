const NetlifyAPI = require('netlify');

exports.handler = async (event) => {
  try {
    // Initialize the Netlify API client
    const client = new NetlifyAPI(process.env.NETLIFY_API_TOKEN);
    
    // Get site ID from environment variable
    const siteId = process.env.NETLIFY_SITE_ID;
    
    if (!process.env.NETLIFY_API_TOKEN || !siteId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Missing required environment variables. Please set NETLIFY_API_TOKEN and NETLIFY_SITE_ID." 
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
    
    // Get form submissions for the car-submissions form
    const submissions = await client.listFormSubmissions({
      form_id: 'car-submissions',
      site_id: siteId
    });
    
    // Map and format submissions into car objects
    const cars = submissions.map(submission => {
      const { data, id, created_at } = submission;
      
      return {
        id,
        make: data.make || '',
        model: data.model || '',
        year: data.year || '',
        price: data.price || '',
        mileage: data.mileage || '',
        engine: data.engine || '',
        transmission: data.transmission || '',
        fuel: data.fuel || '',
        drive: data.drive || '',
        colour: data.colour || '',
        registration: data.registration || '',
        features: data.features || '',
        images: data.images || '',
        isFeatured: data.isFeatured === 'true',
        dateAdded: created_at
      };
    });
    
    // Return the cars as JSON
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ cars })
    };
  } catch (error) {
    console.error('Error fetching car submissions:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};