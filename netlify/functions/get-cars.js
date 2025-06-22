exports.handler = async (event) => {
  console.log("Function get-cars started");
  try {
    // Dynamically import the netlify package
    const { default: NetlifyAPI } = await import('netlify');
    
    // Initialize the Netlify API client
    const token = process.env.NETLIFY_API_TOKEN;
    const siteId = process.env.NETLIFY_SITE_ID;
    
    console.log("Environment check - Have token:", !!token, "Have siteId:", !!siteId);
    
    if (!token || !siteId) {
      console.log("Missing environment variables");
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: "Missing required environment variables. Please set NETLIFY_API_TOKEN and NETLIFY_SITE_ID." 
        })
      };
    }
    
    // Initialize client with the token
    const client = new NetlifyAPI(token);
    console.log("Netlify client initialized");
    
    // Get form submissions for the car-submissions form
    console.log(`Attempting to fetch submissions for form 'car-submissions' on site ${siteId}`);
    const submissions = await client.listFormSubmissions({
      form_id: 'car-submissions',
      site_id: siteId
    });
    
    console.log(`Retrieved ${submissions.length} form submissions`);
    
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
    
    console.log(`Processed ${cars.length} cars`);
    
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
    console.error('Error in get-cars function:', error.message, error.stack);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: error.message, 
        stack: error.stack 
      })
    };
  }
};