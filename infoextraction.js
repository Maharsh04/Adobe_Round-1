const AdmZip = require('adm-zip');
const fs = require('fs');
const { csvAdd } = require('./csvFileHandle.js');
let extractedData = [];

module.exports.infoExtract = async function infoExtract(OUTPUT_ZIP) {

    // Initial setup to access zip file
    const zip = new AdmZip(OUTPUT_ZIP);
    const entry = zip.getEntry('structuredData.json');

    if (entry) {
        const structuredDataBuffer = zip.readFile(entry);

        // Extracting javascript object containing extracted pdf data 
        const structuredData = JSON.parse(structuredDataBuffer.toString());


        let st = "";                        //string form of extracted data
        let ele = structuredData.elements;
        ele.forEach(element => {
            if (element.Text) {
                st += element.Text + "\n";
            }
        });

        //Data extraction Logic 

        //Data of Bussiness owner
        let end = st.indexOf("\n");
        let B_Name = st.slice(0, end);          //Bussiness_Name
        B_Name = B_Name.trim();
        st = st.substr(end + 1);

        let comma = st.indexOf(",");
        let B_StreeAdd = st.slice(0, comma);        //Bussiness_StreetAddressName
        B_StreeAdd = B_StreeAdd.trim();
        st = st.substr(comma + 1);

        comma = st.indexOf(",");
        let B_city = st.slice(0, comma);            //Bussiness_City
        B_city = B_city.trim();
        st = st.substr(comma + 1);
        end = st.indexOf("\n");

        if (end < 5) {
            st = st.substr(end + 1);
        }
        end = st.indexOf("\n");
        let B_country = st.slice(0, end);           //Bussiness_Country
        B_country = B_country.trim();
        st = st.substr(end + 1);

        end = st.indexOf("\n");
        let B_zipCode = st.slice(0, end);           //Bussiness_ZipCode
        B_zipCode = B_zipCode.trim();
        st = st.substr(end + 1);

        let hash = st.indexOf("#");
        st = st.substr(hash + 2);
        let issue_index = st.indexOf("Issue");
        let Invoice_number = st.slice(0, issue_index);          //Bussiness_InvoiceNumber
        Invoice_number = Invoice_number.trim();
        st = st.substr(issue_index);

        end = st.indexOf("\n");
        let issue_date = "";                                    //Invoice_IssueDate
        if (end < 15) {
            st = st.substring(end + 1);
            end = st.indexOf("\n");
            issue_date = st.slice(0, 10);
            st = st.substr(end + 1);
        }
        else {
            issue_date = st.slice(11, 22);
            st = st.substr(23);
        }

        end = st.indexOf("\n");
        if (end == 0) {
            st = st.substring(end + 1);
            end = st.indexOf("\n");
        }
        st = st.substr(end + 1);
        end = st.indexOf("\n");
        let B_discription = st.slice(0, end);           //Bussiness_Discription
        B_discription = B_discription.trim();
        st = st.substr(end + 1);

        end = st.indexOf("\n");
        st = st.substr(end + 1);
        let details = st.indexOf("DETAILS");
        if (details == 0) {
            end = st.indexOf("\n");
            st = st.substr(end + 1);
            end = st.indexOf("\n");
            st = st.substr(end + 1);
        }

        //Customer Details extraction
        let c_name = "";
        let c_email = "";
        let c_phone = "";
        let c_addressLine1 = "";
        let c_addressLine2 = "";
        let invoice_discription = "";
        let due_date = "";

        let Item_index = st.indexOf("ITEM");
        let newSt = st.slice(0, Item_index);         //string containing only data of customer
        st = st.substr(Item_index);

        let due_index = newSt.indexOf("Due date");
        due_date = newSt.slice(due_index + 10, due_index + 20);

        let atRate = newSt.indexOf("@");
        let space = newSt.indexOf(" ");
        end = newSt.indexOf("\n");

        while (space < atRate && space < end) {
            c_name += newSt.slice(0, space + 1);
            newSt = newSt.substr(space + 1);
            space = newSt.indexOf(" ");
            atRate = newSt.indexOf("@");
            end = newSt.indexOf("\n");
        }

        if (due_index < atRate) {

            while (end < due_index) {
                invoice_discription += " " + newSt.slice(0, end);
                newSt = newSt.substr(end + 1);
                end = newSt.indexOf("\n");
                due_index = newSt.indexOf("Due");
            }
            end = newSt.indexOf("\n");
            newSt = newSt.substr(end + 1);

            end = newSt.indexOf("\n");
            dot = newSt.indexOf(".");
            if (dot < end) {
                atRate = newSt.indexOf("@");
                c_email += newSt.slice(0, atRate + 1);
                newSt = newSt.substr(atRate + 1);
                dot = newSt.indexOf(".");
                c_email += newSt.slice(0, dot + 1);
                c_email += "com";
            }
            else {
                c_email = newSt.slice(0, end);
            }

            end = newSt.indexOf("\n");
            newSt = newSt.substr(end + 1);
            end = newSt.indexOf("\n");
            invoice_discription += newSt.slice(0, end);

            newSt = newSt.substr(end + 1);
            end = newSt.indexOf("\n");

            let complete_email = true;
            if (end < 10) {
                complete_email = false;
                newSt = newSt.substr(end + 1);
                end = newSt.indexOf("\n");
            }
            c_phone = newSt.substr(0, 12);

            newSt = newSt.substr(13);
            end = newSt.indexOf("\n");
            if (end < 3) {
                newSt = newSt.substr(end + 1);
                end = newSt.indexOf("\n");
            }
            if (complete_email) {
                if (!isNumeric(newSt[0])) {
                    while (newSt.indexOf('$') > 0) {
                        invoice_discription += newSt.slice(0, end);
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");

                    //Address line one contains 3 words seperated by two spaces
                    let count = 0;
                    while (count < 3) {
                        count++;
                        c_addressLine1 += newSt.slice(0, space + 1);
                        newSt = newSt.substr(space + 1);
                        space = newSt.indexOf(" ");
                    }
                    end = newSt.indexOf("\n");

                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");
                    while (newSt.indexOf("ITEM") > 0) {
                        if (end < 15 && c_addressLine2 == "") {
                            c_addressLine2 = newSt.slice(0, end);
                            newSt = newSt.substr(end + 1);
                            end = newSt.indexOf("\n");
                        }
                        else {
                            invoice_discription += newSt.slice(0, end);
                            newSt = newSt.substr(end + 1);
                            end = newSt.indexOf("\n");
                        }
                    }
                }
                else {
                    let count = 0;
                    space = newSt.indexOf(" ");
                    while (count < 3) {
                        count++;
                        c_addressLine1 += newSt.slice(0, space + 1);
                        newSt = newSt.substr(space + 1);
                        space = newSt.indexOf(" ");
                    }
                    end = newSt.indexOf("\n");
                    if (end == 0) {
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                    if (end < 15) {
                        c_addressLine2 = newSt.slice(0, end);
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }

                    while (newSt.indexOf('$') > 0) {
                        invoice_discription += newSt.slice(0, end);
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");

                    if (end < 15 && c_addressLine2 == "") {
                        c_addressLine2 = newSt.slice(0, end);
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                    while (newSt.length > 0) {
                        invoice_discription += newSt.slice(0, end);
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                }
            }
            else {
                while (newSt.indexOf('$') > 0) {
                    invoice_discription += newSt.slice(0, end);
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");
                }
                newSt = newSt.substr(end + 1);
                end = newSt.indexOf("\n");

                let count = 0;
                while (count < 3) {
                    count++;
                    c_addressLine1 += newSt.slice(0, space + 1);
                    newSt = newSt.substr(space + 1);
                    space = newSt.indexOf(" ");
                }
                end = newSt.indexOf("\n");

                newSt = newSt.substr(end + 1);
                end = newSt.indexOf("\n");

                if (end < 15 && newSt.indexOf("ITEM") > 0) {
                    c_addressLine2 = newSt.slice(0, end);
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");
                }
                while (newSt.indexOf("ITEM") > 0) {
                    invoice_discription += newSt.slice(0, end);
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");
                }
            }
        }

        else {
            atRate = newSt.indexOf("@");
            c_email = newSt.slice(0, atRate + 1);
            c_email = c_email.trim();
            newSt = newSt.substring(atRate + 1);

            let dot = newSt.indexOf(".");
            end = newSt.indexOf("\n");
            space = newSt.indexOf(" ");
            let email_extention = false;

            if (dot < end) {
                email_extention = true;
                c_email = c_email.trim();
                c_email += newSt.slice(0, dot + 1) + "com";
                newSt = newSt.substr(dot);
                end = newSt.indexOf("\n");
                space = newSt.indexOf(" ");
                if (end < space) {
                    newSt = newSt.substr(end + 1);
                }
                else {
                    newSt = newSt.substr(space + 1);
                }
            }
            else {
                c_email += newSt.slice(0, end);
                end = newSt.indexOf("\n");
                newSt = newSt.substr(end + 1);
            }

            if (email_extention) {
                end = newSt.indexOf("\n");
                if (end == 0) {
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");
                }
                space = newSt.indexOf(" ");
                if (end < 4) {
                    newSt = newSt.substr(end + 1);

                }
                else if (space < 3) {
                    newSt = newSt.substr(space + 1);
                }

                if (isNumeric(newSt[0])) {
                    c_phone = newSt.slice(0, 12);
                    newSt = newSt.substr(14);
                    space = newSt.indexOf(" ");

                    let count = 0;
                    while (count < 3) {
                        count++;
                        c_addressLine1 += newSt.slice(0, space + 1);
                        newSt = newSt.substr(space + 1);
                        space = newSt.indexOf(" ");
                    }
                    end = newSt.indexOf("\n");
                    if (end == 0) {
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                    c_addressLine2 = newSt.slice(0, end);
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");

                    while (newSt.length > 0 && newSt.indexOf("$") > 0) {
                        if (newSt.indexOf("DETAILS") == 0 || newSt.indexOf("PAYMENT") == 0 || newSt.indexOf("Due date") == 0) {
                            newSt = newSt.substr(end + 1);
                            end = newSt.indexOf("\n");
                            continue;
                        }
                        invoice_discription += newSt.slice(0, end);
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                }
                else if (newSt.indexOf("Due date") == 0) {
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");
                    if (end < 3) {
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                    space = newSt.indexOf(" ");
                    c_phone = newSt.slice(0, 12);
                    newSt = newSt.substr(14);

                    let count = 0;
                    while (count < 3) {
                        count++;
                        c_addressLine1 += newSt.slice(0, space + 1);
                        newSt = newSt.substr(space + 1);
                        space = newSt.indexOf(" ");
                    }

                    end = newSt.indexOf("\n");
                    if (end == 0) {
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                    c_addressLine2 = newSt.slice(0, end);
                }
                else {
                    invoice_discription += newSt.slice(0, end);
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");

                    if (end < 5) {
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                    c_phone = newSt.slice(0, 12);
                    newSt = newSt.substr(14);

                    let count = 0;
                    while (count < 3) {
                        count++;
                        c_addressLine1 += newSt.slice(0, space + 1);
                        newSt = newSt.substr(space + 1);
                        space = newSt.indexOf(" ");
                    }
                    end = newSt.indexOf("\n");
                    if (end == 0) {
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                    c_addressLine2 = newSt.slice(0, end);
                }
            }
            else {
                end = newSt.indexOf("\n");
                let com_index = newSt.indexOf("com");
                if (com_index < end) {
                    c_email += newSt.slice(0, com_index + 3);
                    newSt = newSt.substr(com_index + 5);

                    c_phone = newSt.slice(0, 12);
                    newSt = newSt.substr(14);
                    space = newSt.indexOf(" ");

                    let count = 0;
                    while (count < 3) {
                        count++;
                        c_addressLine1 += newSt.slice(0, space + 1);
                        newSt = newSt.substr(space + 1);
                        space = newSt.indexOf(" ");
                    }
                    end = newSt.indexOf("\n");
                    if (end == 0) {
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                    c_addressLine2 = newSt.slice(0, end);

                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");
                    while (newSt.length > 0 && newSt.indexOf("$") > 0) {
                        if (newSt.indexOf("DETAILS") == 0 || newSt.indexOf("PAYMENT") == 0 || newSt.indexOf("Due date") == 0) {
                            newSt = newSt.substr(end + 1);
                            end = newSt.indexOf("\n");
                            continue;
                        }
                        invoice_discription += newSt.slice(0, end);
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                }
                else if (newSt.indexOf("Due date") == 0) {
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");
                    c_email += newSt.slice(0, end);
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");

                    c_phone = newSt.slice(0, 12);
                    newSt = newSt.substr(14);
                    space = newSt.indexOf(" ");

                    let count = 0;
                    while (count < 3) {
                        count++;
                        c_addressLine1 += newSt.slice(0, space + 1);
                        newSt = newSt.substr(space + 1);
                        space = newSt.indexOf(" ");
                    }
                    end = newSt.indexOf("\n");
                    if (end == 0) {
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                    c_addressLine2 = newSt.slice(0, end);
                }
                else {
                    invoice_discription += newSt.slice(0, end);
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");
                    newSt = newSt.substr(end + 1);
                    end = newSt.indexOf("\n");

                    c_phone = newSt.slice(0, 12);
                    newSt = newSt.substr(14);
                    space = newSt.indexOf(" ");

                    let count = 0;
                    while (count < 3) {
                        count++;
                        c_addressLine1 += newSt.slice(0, space + 1);
                        newSt = newSt.substr(space + 1);
                        space = newSt.indexOf(" ");
                    }
                    end = newSt.indexOf("\n");
                    if (end == 0) {
                        newSt = newSt.substr(end + 1);
                        end = newSt.indexOf("\n");
                    }
                    c_addressLine2 = newSt.slice(0, end);
                }
            }
        }

        //Removing space in email
        c_email = c_email.split(" ").join("");
        invoice_discription = invoice_discription.trim();

        //extracting Tax Value
        let tax_index = st.indexOf("%");
        let newst = st.substr(tax_index);
        space = newst.indexOf(" ");
        end = newst.indexOf("\n");
        if (space < end) {
            newst = newst.substr(space + 1);
        }
        else {
            newst = newst.substr(end + 1);
        }

        end = newst.indexOf("\n");
        if (end == 0) {
            newst = newst.substr(end + 1);
            end = newst.indexOf("\n");
        }

        if (newst[0] === '$') {
            end = newst.indexOf("\n");
            newst = newst.substr(end + 1);
        }

        let invoice_tax = newst.slice(0, 2);
        invoice_tax = invoice_tax.trim();

        //Extracting data of Products
        let amount_index = st.indexOf("AMOUNT");
        let subtotal_index = st.indexOf("Subtotal");
        st = st.substring(amount_index, subtotal_index);
        end = st.indexOf("\n");
        st = st.substring(end + 1);

        let productdetails = [];
        //For each product
        while (st.length > 0) {
            let temp = {
                name: "",
                qty: "",
                rate: ""
            }
            end = st.indexOf("\n");
            let product_name = st.slice(0, end);        //Product_Name
            temp.name = product_name.trim();
            st = st.substr(end + 1);

            end = st.indexOf("\n");
            let product_qty = st.slice(0, end);         //Product_quantity
            temp.qty = product_qty.trim();
            st = st.substr(end + 1);

            end = st.indexOf("\n");
            let product_rate = st.slice(0, end);        //Product_rate
            temp.rate = product_rate.trim();
            st = st.substr(end + 1);
            end = st.indexOf("\n");

            st = st.substr(end + 1);

            //Saving product in Products.json
            productdetails.push(temp);
        }


        //function to check charector is number
        function isNumeric(value) {
            return /^-?\d+$/.test(value);
        }

        //For each element of productdetails array (array of object containing product name, quantity and rate)
        // rowData is an object entry for csv file corresponding to each product
        productdetails.forEach(product => {
            const rowData = {
                Bussiness__City: B_city,
                Bussiness__Country: B_country,
                Bussiness__Description: B_discription,
                Bussiness__Name: B_Name,
                Bussiness__StreetAddress: B_StreeAdd,
                Bussiness__Zipcode: B_zipCode,
                Customer__Address__line1: c_addressLine1,
                Customer__Address__line2: c_addressLine2,
                Customer__Email: c_email,
                Customer__Name: c_name,
                Customer__PhoneNumber: c_phone,
                Invoice__BillDetails__Name: product.name,
                Invoice__BillDetails__Quantity: product.qty,
                Invoice__BillDetails__Rate: product.rate,
                Invoice__Description: invoice_discription,
                Invoice__DueDate: due_date,
                Invoice__IssueDate: issue_date,
                Invoice__Number: Invoice_number,
                Invoice__Tax: invoice_tax
            }
            extractedData.push(rowData);
        });

        // Function to write the extracted data to the CSV file
        csvAdd(extractedData);
    }
    else {
        console.log('structuredData.json not found in the zip file.');
    }

    // Clean up - remove the generated zip file
    fs.unlinkSync(OUTPUT_ZIP);
}