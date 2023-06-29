const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

let OUTPUT_CSV = `./extractedData.csv`;

// Using csv-writer library to write csv file 
module.exports.csvAdd = async function csvAdd(extractedData) {
    const csvWriter = createCsvWriter({
        path: OUTPUT_CSV,
        header: [
            { id: 'Bussiness__City', title: 'Bussiness__City' },
            { id: 'Bussiness__Country', title: 'Bussiness__Country' },
            { id: 'Bussiness__Description', title: 'Bussiness__Description' },
            { id: 'Bussiness__Name', title: 'Bussiness__Name' },
            { id: 'Bussiness__StreetAddress', title: 'Bussiness__StreetAddress' },
            { id: 'Bussiness__Zipcode', title: 'Bussiness__Zipcode' },
            { id: 'Customer__Address__line1', title: 'Customer__Address__line1' },
            { id: 'Customer__Address__line2', title: 'Customer__Address__line2' },
            { id: 'Customer__Email', title: 'Customer__Email' },
            { id: 'Customer__Name', title: 'Customer__Name' },
            { id: 'Customer__PhoneNumber', title: 'Customer__PhoneNumber' },
            { id: 'Invoice__BillDetails__Name', title: 'Invoice__BillDetails__Name' },
            { id: 'Invoice__BillDetails__Quantity', title: 'Invoice__BillDetails__Quantity' },
            { id: 'Invoice__BillDetails__Rate', title: 'Invoice__BillDetails__Rate' },
            { id: 'Invoice__Description', title: 'Invoice__Description' },
            { id: 'Invoice__DueDate', title: 'Invoice__DueDate' },
            { id: 'Invoice__IssueDate', title: 'Invoice__IssueDate' },
            { id: 'Invoice__Number', title: 'Invoice__Number' },
            { id: 'Invoice__Tax', title: 'Invoice__Tax' }
        ],
    });

    // Adding extracted information to the same csv file
    csvWriter.writeRecords(extractedData)
        .then(() => console.log('CSV file created:', OUTPUT_CSV))
        .catch(error => console.log('Error writing to CSV:', error));
}