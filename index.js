const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const sharp = require("sharp");

exports.handler = async (event) => {
  const bucketName = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  try {
    // Get the image from the S3 bucket
    const image = await S3.getObject({
      Bucket: bucketName,
      Key: key,
    }).promise();

    // Resize the image using sharp
    const resizedImage = await sharp(image.Body)
      .resize(800) // Adjust width to 800px, maintain aspect ratio
      .toBuffer();

    // Upload the resized image back to the S3 bucket
    const resizedKey = `resized/${key}`;
    await S3.putObject({
      Bucket: bucketName,
      Key: resizedKey,
      Body: resizedImage,
      ContentType: "image/jpeg", // or 'image/png' based on your needs
    }).promise();

    console.log(`Successfully resized and uploaded image to ${resizedKey}`);
    return { statusCode: 200, body: "Image resized successfully" };
  } catch (error) {
    console.error("Error resizing image:", error);
    return { statusCode: 500, body: "Error resizing image" };
  }
};
