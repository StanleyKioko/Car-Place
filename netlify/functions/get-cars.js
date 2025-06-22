exports.handler = async (event) => {
  console.log("Function get-cars started (using fetch API)");
  try {
    // Initialize the API variables
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
    
    // First, get a list of all forms for this site to ensure we use the correct form_id
    console.log(`Attempting to fetch forms for site ${siteId}`);
    
    const formsResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!formsResponse.ok) {
      const errorText = await formsResponse.text();
      throw new Error(`Netlify API responded with ${formsResponse.status} when fetching forms: ${errorText}`);
    }
    
    const forms = await formsResponse.json();
    console.log(`Found ${forms.length} forms on the site`);
    
    // Log all form names to help identify the correct one
    forms.forEach(form => {
      console.log(`Form ID: ${form.id}, Form Name: ${form.name}`);
    });
    
    // Find the car submissions form
    const carForm = forms.find(form => 
      form.name.toLowerCase().includes('car') || 
      form.name === 'car-submissions'
    );
    
    if (!carForm) {
      throw new Error(`Could not find a form with 'car' in the name. Available forms: ${forms.map(f => f.name).join(', ')}`);
    }
    
    console.log(`Found car form with ID: ${carForm.id}, Name: ${carForm.name}`);
    
    // Use the found form ID to fetch submissions
    const submissionsResponse = await fetch(`https://api.netlify.com/api/v1/forms/${carForm.id}/submissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!submissionsResponse.ok) {
      const errorText = await submissionsResponse.text();
      throw new Error(`Netlify API responded with ${submissionsResponse.status} when fetching submissions: ${errorText}`);
    }
    
    const submissions = await submissionsResponse.json();
    console.log(`Retrieved ${submissions.length} form submissions`);
    
    // If we don't have any real submissions, use mock data for now
    if (submissions.length === 0) {
      console.log("No real submissions found, using mock data");
      const mockCars = [
        {
          id: "mock-1",
          make: "Toyota",
          model: "Corolla",
          year: "2023",
          price: "2500000",
          mileage: "5000",
          engine: "1.8L",
          transmission: "Automatic",
          fuel: "Petrol",
          drive: "FWD",
          colour: "White",
          registration: "KDA 123X",
          features: "Air conditioning, Bluetooth, Reverse camera",
          images: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          isFeatured: true,
          dateAdded: new Date().toISOString()
        },
        {
          id: "mock-2",
          make: "Honda",
          model: "Civic",
          year: "2022",
          price: "2300000",
          mileage: "8000",
          engine: "1.5L Turbo",
          transmission: "CVT",
          fuel: "Petrol",
          drive: "FWD",
          colour: "Blue",
          registration: "KDB 456Y",
          features: "Sunroof, Cruise control, Heated seats",
          images: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          isFeatured: false,
          dateAdded: new Date().toISOString()
        }
      ];
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ cars: mockCars })
      };
    }
    
    // Map and format submissions into car objects
    const cars = submissions.map(submission => {
      const { data, id, created_at } = submission;
      return {
        id,
        make: data?.make || '',
        model: data?.model || '',
        year: data?.year || '',
        price: data?.price || '',
        mileage: data?.mileage || '',
        engine: data?.engine || '',
        transmission: data?.transmission || '',
        fuel: data?.fuel || '',
        drive: data?.drive || '',
        colour: data?.colour || '',
        registration: data?.registration || '',
        features: data?.features || '',
        images: data?.images || '',
        isFeatured: data?.isFeatured === 'true',
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