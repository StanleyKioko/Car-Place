const NetlifyAPI = require('netlify');

exports.handler = async (event) => {
  try {
    // Initialize the Netlify API client
    const client = new NetlifyAPI(process.env.NETLIFY_API_TOKEN);
    
    // Get site ID from environment variable
    const siteId = process.env.NETLIFY_SITE_ID;
    
    // Get form submissions
    const submissions = await client.listFormSubmissions({
      form_id: 'car-submissions',
      site_id: siteId
    });
    
    // Map and format submissions
    const cars = submissions.map(submission => {
      const { data, id, created_at } = submission;
      
      return {
        id,
        make: data.make,
        model: data.model,
        year: data.year,
        price: data.price,
        mileage: data.mileage,
        engine: data.engine,
        transmission: data.transmission,
        fuel: data.fuel,
        features: data.features,
        description: data.description,
        images: data.images,
        isFeatured: data.isFeatured === 'true',
        specialTags: data.specialTags,
        dateAdded: created_at
      };
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ cars })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};