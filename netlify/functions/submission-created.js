exports.handler = async (event) => {
  const { payload } = JSON.parse(event.body);
  const { form_name, data } = payload;
  
  // Process contact form submissions
  if (form_name === "contact") {
    console.log("Contact form submission received:", data);
    
    // Create email content for contact form
    const contactEmailContent = `
      <h1>New Contact Form Message</h1>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Message:</strong> ${data.message}</p>
      <p><strong>Date Submitted:</strong> ${new Date().toLocaleString()}</p>
    `;
    
    // Note: Netlify Forms handles the email sending automatically
    // The emails specified in the Netlify dashboard will receive notifications
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Contact form submission processed" })
    };
  }
  
  // Only process car-submissions forms (existing functionality)
  if (form_name !== "car-submissions") {
    return { statusCode: 200 };
  }
  
  // Format the images array for better display in the email
  const imageUrls = data.images ? data.images.split(',') : [];
  const formattedImages = imageUrls.map(url => `<img src="${url}" style="max-width: 200px; margin: 5px;" />`).join('');
  
  // Create email content
  const emailContent = `
    <h1>New Car Added</h1>
    <p><strong>Make:</strong> ${data.make}</p>
    <p><strong>Model:</strong> ${data.model}</p>
    <p><strong>Year:</strong> ${data.year}</p>
    <p><strong>Price:</strong> KSh ${data.price}</p>
    <p><strong>Mileage:</strong> ${data.mileage || 'N/A'} km</p>
    <p><strong>Engine:</strong> ${data.engine || 'N/A'}</p>
    <p><strong>Transmission:</strong> ${data.transmission || 'N/A'}</p>
    <p><strong>Fuel Type:</strong> ${data.fuel || 'N/A'}</p>
    <p><strong>Features:</strong> ${data.features || 'None'}</p>
    <p><strong>Description:</strong> ${data.description || 'No description'}</p>
    <p><strong>Featured:</strong> ${data.isFeatured ? 'Yes' : 'No'}</p>
    <p><strong>Special Tags:</strong> ${data.specialTags || 'None'}</p>
    <h2>Images:</h2>
    <div>${formattedImages}</div>
  `;
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Notification sent" })
  };
};