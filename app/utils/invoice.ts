export const invoiceEjs = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-size: 16;
            margin: 62px;
            line-height: 1px;
            font-family: serif;
        }

        hr {
            border-top: 1px solid #eee;
            margin: 40px 0px 24px 0px;
        }

        .top {
            display: flex;
            justify-content: flex-end;
        }

        .top div {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }

        .second {
            display: flex;
            justify-content: space-between;
        }

        .second .info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .third {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            border-bottom: 1px solid #ccc;
        }

        .third .left {
            width: 60%;
        }

        .third .right {
            display: flex;
            width: 40%;
            justify-content: space-between;
        }

        .fourth {
            margin-top: 20px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }

        .fourth .left {
            width: 60%;
        }

        .fourth .right {
            display: flex;
            width: 40%;
            justify-content: space-between;
        }

        .fourth-end {
            margin-top: 20px;
            ;
            border: 1px solid #eee;
        }

        .fifth {
            margin-top: 30px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }

        .fifth .right {
            width: 40%;
        }

        .fifth .left {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            width: 60%;
        }
    </style>
</head>

<body>
    <div class="top">
        <div>
            <p><strong>Company Name</strong></p>
            <p>Some company's address</p>
        </div>
    </div>
    <hr>
    <div class="second">
        <div class="title">
            <h3><%= invoiceName %></h3>
        </div>
        <div class="info">
            <p><strong>Number: </strong><%= invoiceId %></p>
            <p><strong>Date: </strong><%= invoiceDate %></p>
        </div>
    </div>
    <hr>
    <div class="third">
        <div class="left">
            <p>
                <strong>Products</strong>
            </p>
        </div>
        <div class="right">
            <p>
                <strong>Quantity</strong>
            </p>
            <p>
                <strong>Price</strong>
            </p>
            <p>
                <strong>Total</strong>
            </p>
        </div>
    </div>
    <% for(var i=0; i < product.length; i++) { %>
        <div class="fourth">
            <div class="left">
                <p>
                    <%= product[i].name %>
                </p>
            </div>
            <div class="right">
                <p>
                    <%= product[i].actualPrice %>
                </p>
                <p>
                    <%= product[i].quantity %>
                </p>
                <p>
                    <%= product[i].finalPrice %>
                </p>
            </div>
        </div>
     <% } %>
    <div class="fourth-end"></div>
    <div class="fifth">
        <div class="right">&nbsp;</div>
        <div class="left">
            <p><strong>Subtotal: </strong> <%= invoiceSubtotal %></p>
            <p><strong>Discount: </strong> <%= invoiceDiscount %> %</p>
            <p><strong>Total: </strong> <%= invoiceAmount %></p>
        </div>
    </div>
</body>
</html>`;
