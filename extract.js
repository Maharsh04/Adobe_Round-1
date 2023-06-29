const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const { pdfServicesRegionURI } = require('@adobe/pdfservices-node-sdk/src/internal/config/dc-services-default-config');
const { infoExtract } = require('./infoextraction.js');


// Initial setup, create credentials instance
const credentials = PDFServicesSdk.Credentials
    .serviceAccountCredentialsBuilder()
    .fromFile('pdfservices-api-credentials.json')
    .build();

// Create an ExecutionContext using credentials
const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);

// Build extractPDF options
const options = new PDFServicesSdk.ExtractPDF.options.ExtractPdfOptions.Builder()
    .addElementsToExtract(PDFServicesSdk.ExtractPDF.options.ExtractElementType.TEXT, PDFServicesSdk.ExtractPDF.options.ExtractElementType.TABLES)
    .build();

const retryDelay = 10000; // Delay in milliseconds before retrying
const maxRetries = 3; // Maximum number of retries

let i = 0;

function extractInfoFromPDF() {
    if (i >= 100) {
        console.log('All files processed.');
        return;
    }

    const INPUT_PDF = `./resource/output${i}.pdf`;
    const OUTPUT_ZIP = './ExtractTextInfoFromPDF.zip';

    // Create a new operation instance.
    const extractPDFOperation = PDFServicesSdk.ExtractPDF.Operation.createNew();

    const input = PDFServicesSdk.FileRef.createFromLocalFile(
        INPUT_PDF,
        PDFServicesSdk.ExtractPDF.SupportedSourceFormat.pdf
    );

    // Set operation input from a source file.
    extractPDFOperation.setInput(input);

    // Set Options
    extractPDFOperation.setOptions(options);

    let retryCount = 0;

    // Function to retry extraction if it fails due to timeout error
    function retry() {
        if (retryCount >= maxRetries) {
            console.log(`Max retry limit reached for file ${i}. Moving to the next file.`);
            i++;
            extractInfoFromPDF(); // Process the next file
            return;
        }

        console.log(`Retry #${retryCount + 1} for file ${i}. Retrying after ${retryDelay / 1000} seconds.`);
        setTimeout(executeExtraction, retryDelay);
    }

    // Creates a zip file containing structuredData.json file and all tables contained .csv files
    function executeExtraction() {
        extractPDFOperation.execute(executionContext)
            .then(result => result.saveAsFile(OUTPUT_ZIP))
            .then(() => {
                console.log(`Successfully extracted information from file${i}.`);
                infoExtract(OUTPUT_ZIP);    // Function to extract specific information required as per problem statement
                i++;
                extractInfoFromPDF(); // Process the next file
            })
            .catch((err) => {
                console.log(err);
                retryCount++;
                retry(); // Retry extraction
            });
    }

    executeExtraction();
}

extractInfoFromPDF();




