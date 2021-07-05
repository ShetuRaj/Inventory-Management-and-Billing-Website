
# Inventory Management and Billing Website using NodeJS, MySQL and Javascript 

This is a free lancing project where I made a dynamic website for managing inventory with features like Billing, Adding, Removing Inventory/Stock and Analysis of Sales and Stocks with custom filters for a retail client


## Demo

Here is a working demo of the website:- https://www.youtube.com/watch?v=MTikCHU2FL0&t=603s

  
## Authors

- [@sheturaj](https://github.com/ShetuRaj)

  
## Contributing

Contributions are always welcome!

You can let me know if you want to contribute to this project. 



  
## Features

- Stock Inventory
- Billing
- Sales Analysis
- Stock Analysis
- Generation of Bill in printable format
- Passport Authentication ([Tutorial Link](https://www.youtube.com/watch?v=-RCnNyD0L-s))

  
## Tech Stack

**Client:** Javascript, Bootstrap, Semantic-UI

**Server:** Node, Express

  
## Install dependencies, configure MySQL database and run locally

Clone the project

```bash
  git clone https://github.com/ShetuRaj/Inventory-Management-and-Billing-Website.git
```

Go to the project directory

```bash
  cd Inventory-Management-and-Billing-Website
```

Install dependencies

```bash
  npm install
```

Install MySQL

```bash
  https://dev.mysql.com/downloads/installer/
```

Configure MySQL

```bash
  https://www.youtube.com/watch?v=u96rVINbAUI
```
Download my sql database .sql file from here

```bash
  https://drive.google.com/file/d/1r0zaU-5Jzvf8aAqs4a-yiOMHxdkR5Y87/view?usp=sharing
```
Open mysql command line prompt and run the following commands:-

```bash
  create warehousedb
```

Start the server

```bash
  npm run start
```

  
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`SESSION_SECRET=secret`

`db_name=<database_name>`

`db_user_name=<database_user_name>`

`db_password=<database_password>`

`login_id=<login_email_address>`

`login_password=<password_for_login>`



Here is an example:-

`SESSION_SECRET=secret`

`db_name=mysqldb`

`db_user_name=root`

`db_password=root1234`

`login_id=admin@xyz.com`

`login_password=admin1234`
  
In the `.env` file, don't use double quotes for values and there should be no space before or after `=` .

  
