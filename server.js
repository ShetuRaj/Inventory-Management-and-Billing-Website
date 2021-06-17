if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
  const express = require('express')
  const app = express()
  const bcrypt = require('bcrypt')
  const passport = require('passport')
  const flash = require('express-flash')
  const session = require('express-session')
  const methodOverride = require('method-override')
  const mysql = require('mysql');
  const bodyparser = require('body-parser');
  const dotenv = require('dotenv');

  var port = process.env.PORT || 5000;
  app.use(bodyparser.json());

  var mysqlConnection = mysql.createConnection({
    host:'localhost',
    user: process.env.db_user_name,
    password: process.env.db_password,
    database: process.env.db_name
  });
  
  mysqlConnection.connect((err)=>{
    if(!err)
    console.log('DB connection succeeded')
    else
    console.log('DB connection failed \n Error :' + JSON.stringify(err,undefined,2));
  })

  const users = []

    users.push({
      id: Date.now().toString(),
      name: 'Admin',
      email: process.env.login_id,
      password: process.env.login_password
    })
  

  const initializePassport = require('./passport-config')
const e = require('express')
  initializePassport(
    
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )
  
 
  app.use( express.static( "public" ) )
  app.set('view-engine', 'ejs')
  app.use(express.urlencoded({ extended: false }))
  app.use(flash())
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method'))
  
  app.get('/', checkAuthenticated, (req, res) => {
    let sql1 = 'SELECT SUM(Amount) AS TotalItemsOrdered FROM ordersdb';

    let query1= mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
      if(!err1){
      // res.render('index.ejs',{
      //   orders:rows
      // });
      console.log('Fetched total amount from ordersdb')
      total_sales = rows1
      console.log(typeof(rows1))

      let sql2 = 'SELECT COUNT(ItemID) AS NumberOfProducts FROM ordersdb';

      let query2= mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
        if(!err2){
        // res.render('index.ejs',{
        //   orders:rows
        // });
        ord_num = rows2
        console.log('Fetched total no. of orders from ordersdb')

        let sql3 = 'SELECT COUNT(ItemID) AS NumberOfProducts FROM stockdb';

        let query3= mysqlConnection.query(sql3, (err3, rows3, fields3)=>{
        if(!err3){
        // res.render('index.ejs',{
        //   orders:rows
        // });
        console.log('Fetched total no. of stocks from stockdb')
        stock_num = rows3

        let sql4 = 'SELECT SUM(Amount) AS TotalItemsOrdered FROM stockdb';
        let query4= mysqlConnection.query(sql4, (err4, rows4, fields4)=>{
          if(!err3){
            total_stock = rows4
            res.render('index.ejs',{
              total_sales:rows1,
              ord_num:rows2,
              stock_num:rows3,
              total_stock:rows4
              });
          }
          else
          console.log(err4);
       
        });
      }
      else
      console.log(err3);
    });

        }
        else
        console.log(err2);
      });


      }
      else
      console.log(err1);
    });
    // res.render('index.ejs', { name: req.user.name })

   

    
    // console.log(total_sales)
    // console.log(ord_num)
    // console.log(stock_num)
    
  })
  
  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
  })
  
  app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))
  
  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
  })
  
  app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      console.log(users)
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
  })
  
  app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })
  
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }
  
  app.listen(port, ()=>console.log(`Express Server is running at ${port} port`))
  app.get('/employees', (req,res) =>{
    mysqlConnection.query('SELECT * FROM warehouse', (err, rows, fields)=>{
      if(!err)
      res.send(rows);
      else
      console.log(err);
    })
  })

//View Orders
  app.get('/orders', checkAuthenticated,(req,res) =>{
    let sql = 'SELECT TransactionID,SUM(Amount) as Amount,TransactionDate,TransactionTime FROM ordersdb GROUP BY TransactionID';

    let query = mysqlConnection.query(sql, (err, rows, fields)=>{
      if(!err){
        let sql1 = 'SELECT * FROM ordersdb'
        let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
          if(!err1){
            res.render('orders.ejs',{
              orders:rows, sub_orders:rows1, selected_item:'None', month_name:'None', year:'None'
            });
           }
           else
            console.log(err1)
        })
       
    }
      else
      console.log(err);
    });
  })

  //View Stocks
  app.get('/viewstocks', checkAuthenticated,(req,res) =>{
    let sql = 'SELECT * FROM stockdb ORDER BY TYear DESC,Tmonth DESC, TDay DESC,StockTime DESC';

    let query = mysqlConnection.query(sql, (err, rows, fields)=>{
      if(!err){
        let sql1 = 'SELECT * FROM branddb' 
        let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
          if(!err1){
            let sql2 = 'SELECT * FROM categorydb'
            let query2 = mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
              if(!err2){
                res.render('viewstocks.ejs',{
                  all_stocks:rows, brands:rows1, categories:rows2,  display_content:'None', filter_type:'None', filter_name:'None'
                    });
                }
              else
              console.log(err2)
            })
      
        }
        else
        console.log(err1)
      })
    }
      else
      console.log(err);
    });
  })

  //Stocks Query Filter
  app.post('/stocks_query',checkAuthenticated, (req, res) => {
    let sql = 'SELECT * FROM stockdb ORDER BY TYear DESC,Tmonth DESC, TDay DESC,StockTime DESC';

    let query = mysqlConnection.query(sql, (err, rows, fields)=>{
      if(!err){
        let sql1 = 'SELECT * FROM branddb' 
        let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
          if(!err1){
            let sql2 = 'SELECT * FROM categorydb'
            let query2 = mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
              if(!err2){
                var selected_item = req.body['exampleRadios']
                if(selected_item == 'brand'){
                  var brand_name = req.body['selected_brand']
                  let sql3 = `SELECT * FROM stockdb WHERE Brand='${brand_name}'`
                  let query3 = mysqlConnection.query(sql3, (err3, rows3, fields3)=>{
                    if(!err3){
                      res.render('viewstocks.ejs',{
                        all_stocks:rows, brands:rows1, categories:rows2, display_content:rows3, filter_type:'brand', filter_name:brand_name
                          });
                    } 
                    else
                    console.log(err3)
                  })
                }

                if(selected_item == 'category'){
                  var category_name = req.body['selected_category']
                  let sql3 = `SELECT * FROM stockdb WHERE Category='${category_name}'`
                  let query3 = mysqlConnection.query(sql3, (err3, rows3, fields3)=>{
                    if(!err3){
                      res.render('viewstocks.ejs',{
                        all_stocks:rows, brands:rows1, categories:rows2, display_content:rows3, filter_type:'category', filter_name:category_name
                          });
                    } 
                    else
                    console.log(err3)
                  })
                }
              }
              else
              console.log(err2)
            })
      
        }
        else
        console.log(err1)
      })
    }
      else
      console.log(err);
    });
  })

  //Fetch Items by ID for billing
  app.post('/fetchitem',checkAuthenticated, (req, res) =>{
    item_id = req.body.itemid
    console.log(req.body)

    let sql = 'SELECT * FROM stockdb WHERE ItemID = ?'
    var response = {
      status  : 'success',
      success : 'Updated Successfully'
  }

    let query = mysqlConnection.query(sql, [item_id], (err, rows, fields)=>{
      if(!err)
      {
      console.log(rows)
      // res.render('viewstocks.ejs',{
      //   orders:rows
      // });
      res.json({success : "Updated Successfully", status : 200, rows:rows});
      }
      else
      console.log(err);
    });
  })

  //Billing
  app.get('/billing',checkAuthenticated, (req, res) => {
    let sql1 = 'SELECT * FROM categorydb'
    
    let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
      if(!err1)
      {
        var category = rows1
        let sql2 = 'SELECT * FROM branddb'
        let query2 = mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
          if(!err2)
          {
            var brand = rows2
            let sql3 = 'SELECT * FROM sizedb'
            let query3 = mysqlConnection.query(sql3, (err3, rows3, fields3)=>{
              if(!err3)
              {
                var size = rows3
                console.log(typeof(category))
                console.log(category)
                console.log(brand)
                console.log(size)
                res.render('bill.ejs',{category:category, brand:brand, size:size})
              }
              else
              console.log(err3)
            })
          }
          else
          console.log(err2)
        })
      }
      else
      console.log(err1)

    
  })
})

//Add New Category
  app.post('/addcategory',checkAuthenticated,(req,res) => {
    let sql = `INSERT INTO categorydb(Category) VALUES ('${req.body.new}') `
    let query = mysqlConnection.query(sql, (err, rows, fields) => {
      if(!err)
      {
        res.redirect('/categories')
      }
      else
      console.log(err)
  })
  })

  //Add New Brand
  app.post('/addbrand',checkAuthenticated,(req,res) => {
    let sql = `INSERT INTO branddb(Brand) VALUES ('${req.body.new}') `
    let query = mysqlConnection.query(sql, (err, rows, fields) => {
      if(!err)
      {
        res.redirect('/brands')
      }
      else
      console.log(err)
  })
  })

  //Add New Size
  app.post('/addsize',checkAuthenticated,(req,res) => {
    let sql = `INSERT INTO sizedb(Size) VALUES ('${req.body.new}') `
    let query = mysqlConnection.query(sql, (err, rows, fields) => {
      if(!err)
      {
        res.redirect('/sizes')
      }
      else
      console.log(err)
  })
  })

  //Orders Filter Query
  app.post('/orders_query', checkAuthenticated,(req,res) => {
    var time_type = req.body['exampleRadios']
    if (time_type == 'month'){
      var month= req.body['selected_month']
      var year = req.body['selected_year']

      const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
      var month_name = monthNames[parseInt(month-1)]

      let sql = `SELECT TransactionID,SUM(Amount) as Amount,TransactionDate,TransactionTime FROM ordersdb WHERE TMonth = ${month} AND TYear = ${year} GROUP BY TransactionID`

      let query = mysqlConnection.query(sql, (err, rows, fields)=>{
        if(!err){
          let sql1 = 'SELECT * FROM ordersdb'
          let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
            if(!err1){
              res.render('orders.ejs',{
                orders:rows, sub_orders:rows1, selected_item:'month', month_name:month_name, year:year
              });
             }
             else
              console.log(err1)
          })
         
      }
        else
        console.log(err);
      });
    }

    if (time_type == 'year'){
      
      var year = req.body['selected_year']

      let sql = `SELECT TransactionID,SUM(Amount) as Amount,TransactionDate,TransactionTime FROM ordersdb WHERE TYear = ${year} GROUP BY TransactionID`

      let query = mysqlConnection.query(sql, (err, rows, fields)=>{
        if(!err){
          let sql1 = 'SELECT * FROM ordersdb'
          let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
            if(!err1){
              res.render('orders.ejs',{
                orders:rows, sub_orders:rows1, selected_item:'year', month_name:'None', year:year
              });
             }
             else
              console.log(err1)
          })
         
      }
        else
        console.log(err);
      });
    }
  })

  //Sales Filter
  app.get('/sales_filter', checkAuthenticated,(req, res) => {
    rows = {}
    res.render('sales_filter.ejs',{is_paramater_set : false,time_type: 'none', filter_type: 'none', display_content: rows, month_name: 'None', year:"None", total_amount:"None"})
  })

  app.get('/stock_filter', (req, res) => {
    res.render('stock_filter.ejs', {filter_type: 'None',display_content: {}, total_items:{}})
  })

  //Stock Filter
  app.post('/stock_filter_query', checkAuthenticated,(req, res) => {
    var filter_type = req.body['exampleRadios1']
    if(filter_type == 'brand'){
      let sql = 'SELECT Brand,count(*) AS Count,SUM(Amount) AS Amount FROM stockdb GROUP BY Brand'
      let query = mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err)
        {
          let sql1 = 'SELECT count(*) AS Count FROM stockdb'
          let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
            if(!err1)
            {
              res.render('stock_filter.ejs',{filter_type: filter_type,display_content: rows, total_items:rows1}) 
            }
            else
            console.log(err1)
          })
        }
        else
        console.log(err)
      })
    }
    if(filter_type == 'category'){
      let sql = 'SELECT Category,count(*) AS Count,SUM(Amount) AS Amount FROM stockdb GROUP BY Category'
      let query = mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err)
        {
          let sql1 = 'SELECT count(*) AS Count FROM stockdb'
          let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
            if(!err1)
            {
              res.render('stock_filter.ejs',{filter_type: filter_type,display_content: rows, total_items:rows1}) 
            }
            else
            console.log(err1)
          })
        }
        else
        console.log(err)
      })
    }
  })

  //Sales Filter
  app.post('/sales_filter_query', checkAuthenticated,(req, res) => {
    console.log(req.body)
    var time_type = req.body['exampleRadios']

    if (time_type == 'month'){

      var month= req.body['selected_month']
      var year = req.body['selected_year']

      const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
      var month_name = monthNames[parseInt(month-1)]
      console.log(month_name)
      if (req.body['exampleRadios1'] == 'all'){
        
        let sql = `SELECT TransactionDate,count(*) as Count,SUM(Amount) as Amount FROM ordersdb WHERE TMonth = ${month} AND TYear = ${year} GROUP BY TransactionDate`;
        let query = mysqlConnection.query(sql, (err, rows, fields) => {
          if(!err)
          {
            let sql1 = `SELECT SUM(Amount) as Amount,count(*) AS Count FROM ordersdb WHERE TMonth = ${month} AND TYear = ${year}`
            let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
              if(!err1)
              {
                var total_amount = rows1
                res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'month', filter_type: 'all', display_content: rows, month_name: month_name, year:year, total_amount:total_amount})
              }
              else
              console.log(err1)
            })
          }
          else
          console.log(err)
      })
      }

      if (req.body['exampleRadios1'] == 'brand'){
        
        let sql = `SELECT Brand,count(*) AS Count,SUM(Amount) as Amount FROM ordersdb WHERE TMonth=${month} AND TYear = ${year} GROUP BY Brand`;
        let query = mysqlConnection.query(sql, (err, rows, fields) => {
          if(!err)
          {
            let sql1 = `SELECT SUM(Amount) as Amount,count(*) AS Count FROM ordersdb WHERE TMonth = ${month} AND TYear = ${year}`
            let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
              if(!err1)
              {
                var total_amount = rows1
                res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'month', filter_type: 'brand', display_content: rows, month_name: month_name, year:year, total_amount:total_amount})
              }
              else
              console.log(err1)
            })
          }
          else
          console.log(err)
      })
      }

      if (req.body['exampleRadios1'] == 'category'){
        
        let sql = `SELECT Category,count(*) AS Count,SUM(Amount) as Amount FROM ordersdb WHERE TMonth=${month} AND TYear = ${year} GROUP BY Category`;
        let query = mysqlConnection.query(sql, (err, rows, fields) => {
          if(!err)
          {
            let sql1 = `SELECT SUM(Amount) as Amount,count(*) AS Count FROM ordersdb WHERE TMonth = ${month} AND TYear = ${year}`
            let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
              if(!err1)
              {
                var total_amount = rows1
                res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'month', filter_type: 'category', display_content: rows, month_name: month_name, year:year, total_amount:total_amount})
              }
              else
              console.log(err1)
            })
          }
          else
          console.log(err)
      })
      }
    }

    if (time_type == 'year')
      var year= req.body['selected_year']

      if (req.body['exampleRadios1'] == 'all'){
        
        let sql = `SELECT TMonth,count(*) as Count,SUM(Amount) as Amount FROM ordersdb WHERE TYear = ${year} GROUP BY TMonth`;
        let query = mysqlConnection.query(sql, (err, rows, fields) => {
          if(!err)
          {
            let sql1 = `SELECT SUM(Amount) as Amount,count(*) AS Count FROM ordersdb WHERE TYear = ${year}`
            let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
              if(!err1)
              {
                var total_amount = rows1
                res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'year', filter_type: 'all', display_content: rows, month_name: 'None', year:year, total_amount:total_amount})
              }
              else
              console.log(err1)
            })
          }
          else
          console.log(err)
      })
      }

      if (req.body['exampleRadios1'] == 'brand'){
        
        let sql = `SELECT Brand,count(*) AS Count,SUM(Amount) as Amount FROM ordersdb WHERE TYear = ${year} GROUP BY Brand`;
        let query = mysqlConnection.query(sql, (err, rows, fields) => {
          if(!err)
          {
            let sql1 = `SELECT SUM(Amount) as Amount,count(*) AS Count FROM ordersdb WHERE TYear = ${year}`
            let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
              if(!err1)
              {
                var total_amount = rows1
                res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'year', filter_type: 'brand', display_content: rows, month_name: 'None', year:year, total_amount:total_amount})
              }
              else
              console.log(err1)
            })
          }
          else
          console.log(err)
      })
      }

      if (req.body['exampleRadios1'] == 'category'){
        
        let sql = `SELECT Category,count(*) AS Count,SUM(Amount) as Amount FROM ordersdb WHERE TYear = ${year} GROUP BY Category`;
        let query = mysqlConnection.query(sql, (err, rows, fields) => {
          if(!err)
          {
            let sql1 = `SELECT SUM(Amount) as Amount,count(*) AS Count FROM ordersdb WHERE TYear = ${year}`
            let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
              if(!err1)
              {
                var total_amount = rows1
                res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'year', filter_type: 'category', display_content: rows, month_name: 'None', year:year, total_amount:total_amount})
              }
              else
              console.log(err1)
            })
          }
          else
          console.log(err)
      })
    }

    
  })

  //View Categories
  app.get('/categories', checkAuthenticated,(req, res) => {
    let sql1 = 'SELECT * FROM categorydb'
    let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
      if(!err1)
      {
        var category = rows1
        res.render('categories.ejs', {category:category})
      }
      else
      console.log(err1)
  })
})

//View Brands
  app.get('/brands', checkAuthenticated,(req, res) => {
    let sql2 = 'SELECT * FROM branddb'
    let query2 = mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
      if(!err2)
      {
        var brand = rows2
        res.render('brands.ejs',{brand:brand})
      }
      else
      console.log(err2)
  })
})

//View Sizes
  app.get('/sizes', checkAuthenticated,(req, res) => {
    let sql2 = 'SELECT * FROM sizedb'
    let query2 = mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
      if(!err2)
      {
        var size = rows2
        res.render('sizes.ejs',{size:size})
      }
      else
      console.log(err2)
    })
  })

  //View Stocks
  app.get('/stocks', checkAuthenticated,(req, res) => {
    let sql1 = 'SELECT * FROM categorydb'
    
    let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
      if(!err1)
      {
        var category = rows1
        let sql2 = 'SELECT * FROM branddb'
        let query2 = mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
          if(!err2)
          {
            var brand = rows2
            let sql3 = 'SELECT * FROM sizedb'
            let query3 = mysqlConnection.query(sql3, (err3, rows3, fields3)=>{
              if(!err3)
              {
                var size = rows3
                console.log(typeof(category))
                console.log(category)
                console.log(brand)
                console.log(size)
                res.render('stocks.ejs',{category:category, brand:brand, size:size})
              }
              else
              console.log(err3)
            })
          }
          else
          console.log(err2)
        })
      }
      else
      console.log(err1)

    
  })
    // res.render('stocks.ejs')
  })

  //Submit Bill
  app.post('/submitbill', checkAuthenticated,(req, res) => {
    console.log(`\nRequest body = `)
    console.log(req.body)
    var request1 = req.body

    var date_format = new Date();
    var transaction_date = date_format.getDate()+ '/' +(parseInt(date_format.getMonth()+1)).toString() + '/'+ date_format.getFullYear()
    var transaction_time = date_format.getHours() + ':' + date_format.getMinutes() + ':' + date_format.getSeconds()
    var transaction_id = "SHW"+ date_format.getDate() + date_format.getMonth() + date_format.getFullYear() + date_format.getHours() + date_format.getMinutes() + date_format.getSeconds()
    let new_req = {};

    var item_ids = []

    for(i in request1) {
      if(i.includes("itemid")){
        item_ids.push(request1[i])
      }
    }

      for (i in request1){
      if(i.includes("number") || i.includes("total")){
      delete i
      }
      else
      new_req[i] = request1[i]
      }
      
      const data = Object.entries(new_req).reduce((carry, [key, value]) => {
          const [text] = key.split(/\d+/);
          const index = key.substring(text.length) - 1;
          if (!Array.isArray(carry[index])) carry[index] = [];
          carry[index].push(value);
          return carry;
      }, []);

      for (let i = 0; i < data.length; i++) {
        data[i].push(transaction_date);
        data[i].push(transaction_time);
        data[i].push(transaction_id);
        data[i].push(date_format.getDate())
        data[i].push(date_format.getMonth() + 1)
        data[i].push(date_format.getFullYear())
       }
      
    console.log(`\nINSERT Array = `)
    console.log(data)
    let sql = `INSERT INTO ordersdb(ItemID,ItemName,Category,Brand,Size,Amount,CustomerNumber,TransactionDate,TransactionTime,TransactionID,TDay,TMonth,TYear) VALUES ? `
    let query = mysqlConnection.query(sql,[ data], (err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully inserted values into ordersdb')
     var sql2 = 'DELETE FROM stockdb WHERE ItemID = ?'
      for(j=0;j<item_ids.length;j++){
        var query2 = mysqlConnection.query(sql2,[item_ids[j]], (err2, rows2, fields2)=>{
          if(!err2)
          {
          console.log('Successfully deleted corresponding values from stockdb')
          // res.redirect('/orders')
          
          }
          else
          console.log(err2);
        });
      }
      res.redirect('/orders')
      
      // res.redirect('/orders')
      }
      else
      console.log(err);
    });
  })

  //Submit Stock
  app.post('/submitstock', checkAuthenticated,(req, res) => {
    console.log(req.body)
    var request1 = req.body

    var date_format = new Date();
    var transaction_date = date_format.getDate()+ '/'+ (parseInt(date_format.getMonth()+1)).toString() +'/'+date_format.getFullYear()
    console.log((parseInt(date_format.getMonth()+1)).toString())
    var transaction_time = date_format.getHours() + ':' + date_format.getMinutes() + ':' + date_format.getSeconds()
    let new_req = {};

      for (i in request1){
      if(i.includes("number") || i.includes("total")){
      delete i
      }
      else
      new_req[i] = request1[i]
      }
      
      const data = Object.entries(new_req).reduce((carry, [key, value]) => {
          const [text] = key.split(/\d+/);
          const index = key.substring(text.length) - 1;
          if (!Array.isArray(carry[index])) carry[index] = [];
          carry[index].push(value);
          return carry;
      }, []);

      for (let i = 0; i < data.length; i++) {
        data[i].push(transaction_date);
        data[i].push(transaction_time);
        data[i].push(date_format.getDate())
        data[i].push(date_format.getMonth() + 1)
        data[i].push(date_format.getFullYear())
       }
      

    let sql = `INSERT INTO stockdb(ItemID,ItemName,Category,Brand,Size,Amount,StockDate,StockTime,TDay,TMonth,TYear) VALUES ? `
    let query = mysqlConnection.query(sql,[ data], (err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully inserted values')
      res.redirect('/viewstocks')
      }
      else
      console.log(err);
    });
  })

  //Delete Order
  app.post('/deleteitem', checkAuthenticated,(req,res) => {
    console.log('deleteitem called')
    var deleteid = req.body.deleteid
    let sql = 'DELETE FROM ordersdb WHERE ItemID = ?'
    let query = mysqlConnection.query(sql,[ deleteid], (err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully deleted a value')
      res.redirect('/orders')
      
      }
      else
      console.log(err);
    });
  })

  //Delete Category
  app.post('/deletecategory', checkAuthenticated,(req,res) => {
    console.log('deletecategory called')
    var deleteid = req.body.deleteid
    let sql = 'DELETE FROM categorydb WHERE Category = ?'
    let query = mysqlConnection.query(sql,[ deleteid], (err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully deleted a category')
      res.redirect('/categories')
      
      }
      else
      console.log(err);
    });
  })

  //Delete Brand
  app.post('/deletebrand', checkAuthenticated,(req,res) => {
    console.log('deletebrand called')
    var deleteid = req.body.deleteid
    let sql = 'DELETE FROM branddb WHERE Brand = ?'
    let query = mysqlConnection.query(sql,[ deleteid], (err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully deleted a brand')
      res.redirect('/brands')
      
      }
      else
      console.log(err);
    });
  })

  //Delete Size
  app.post('/deletesize', checkAuthenticated,(req,res) => {
    console.log('deletesize called')
    var deleteid = req.body.deleteid
    let sql = 'DELETE FROM sizedb WHERE Size = ?'
    let query = mysqlConnection.query(sql,[ deleteid], (err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully deleted a size')
      res.redirect('/sizes')
      
      }
      else
      console.log(err);
    });
  })

  //Delete Stock
  app.post('/deletestock', checkAuthenticated,(req,res) => {
    console.log('deleteitem called')
    var deleteid = req.body.deleteid
    let sql = 'DELETE FROM stockdb WHERE ItemID = ?'
    let query = mysqlConnection.query(sql,[ deleteid], (err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully deleted a value')
      res.redirect('/viewstocks')
      
      }
      else
      console.log(err);
    });
  })