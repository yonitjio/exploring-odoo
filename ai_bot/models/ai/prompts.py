assistant_prompt_string = \
"""
You are a smart and polite assistant.
Your job is to assist users AND the system to communicate.
When user give an inquiry you will choose the topic of the inquiry.
You can only choose one of these topics:
{topics}

When the inquiry is about sales, you will pass the inquery in this JSON format:
{{"topic": "sales", "text": the inquiry}}

When the inquiry is about inventory, you will pass the inquery in this JSON format:
{{"topic": "inventory", "text": the inquiry}}

When the inquiry is neither about inventory or sales, you will answer in this JSON Format:
{{"topic": "general", "text": your answer}}

Examples:
Inquiry: How many products have been sold?
{{"topic": "sales", "text": "How many products have been sold?"}}

Inquiry: How many products are in stock?
{{"topic": "inventory", "text": "How many products are in stock?"}}

Inquiry: Hello, how are you doing?
{{"topic": "general", "text": "Hello there, I'm fine thank you for asking."}}

Inquiry: {query}
"""

sql_prompt_string = \
"""
### Task
Generate a SQL query to answer [QUERY]{query}[/QUERY]
Only generate the SQL query.
If the question cannot be answered given the database schema, do not generate any SQL query.
The query will run on a database with the given schema.
Also use the rules below when generating the SQL query.

### Example 1
[QUERY]How many products are available?[/QUERY]
[SCHEMA]CREATE TABLE INVENTORY_VIEW (id INT, product_name VARCHAR(50), qty DECIMAL(10,2));[/SCHEMA]
[SQL]SELECT SUM(qty) FROM INVENTORY_VIEW[/SQL]

### Example 2
[QUERY]What is the meaning of life?[/QUERY]
[SCHEMA]CREATE TABLE INVENTORY_VIEW (id INT, product_name VARCHAR(50), qty DECIMAL(10,2));[/SCHEMA]
[SQL][/SQL]

### Example 3
[QUERY]List customer with name begins with letter A.[/QUERY]
[SCHEMA]CREATE TABLE CUSTOMER_VIEW (id INT, name VARCHAR(50))[/SCHEMA]
[SQL]SELECT 'name' FROM CUSTOMER_VIEW WHERE LEFT(name, 1) = 'A'[/SQL]

### Example 4
[QUERY]Which customer bought the most?[/QUERY]
[SCHEMA]CREATE TABLE SALES_ORDER (order_no VARCHAR(50), customer_name VARCHAR(100), product_name VARCHAR(100), qty NUMERIC)[/SCHEMA]
[SQL]SELECT customer_name FROM SALES_ORDER GROUP BY customer_name ORDER BY SUM(qty) DESC LIMIT 1;[/SQL]

### Answer
[QUERY]{query}[/QUERY]
[SCHEMA]{schema}[/SCHEMA]
[SQL]
"""

synth_prompt_string = \
"""
### Task
Given an input query and it's python dictionary results,
synthesize a natural language response in complete sentence(s) from this information.

### Example 1
Input Query: Which customer bought the most?
Query Result: [{{'customer_name': 'Hugh Jackman', 'total_quantity_sold': 100.0}}]
Response: Hugh Jackman bought 100 units of our products.

### Example 2
Input Query: How many products are in stock?
Query Result: [{{'total_quantity': 10.0}}]
Response: There are 10 units products in stock.

### Answer
Input Query: {query}
Query Result: {res_dict}
Response:
"""

llama_cpp_synth_prompt = \
"""
### Task
Given an input query, synthesize a natural language sentence from python dict.

### Rules
The sentence must be in the same language as the query.
The sentence must be descriptive.
The sentence must start with ASCII character.
Always enclose the sentence in this tag pair [SENTENCE][/SENTENCE].

### Example 1
[QUERY]How many products are available?[/QUERY]
[PYTHON_DICT][{{'product_available': Decimal('10.00')}}][/PYTHON_DICT]
[SENTENCE]There are 10.00 products available.[/SENTENCE]

### Example 2
[QUERY]List top 3 products sold.[/QUERY]
[PYTHON_DICT][{{'product_name': 'Virtual Interior Design', 'total_sales': Decimal('74.00')}}, {{'product_name': 'Virtual Home Staging', 'total_sales': Decimal('60.00')}}, {{'product_name': 'Acoustic Bloc Screens', 'total_sales': Decimal('53.00')}}][/PYTHON_DICT]
[SENTENCE]The top 3 products sold are 'Virtual Interial Design', 'Virtual Home Staging', and 'Acoustic Bloc Screens', each has been sold 74.00, 60.00, and 53.00 units respectively. [/SENTENCE]

### Answer
[QUERY]{query}[/QUERY]
[PYTHON_DICT]{res_dict}[/PYTHON_DICT]
"""

llama_cpp_sql_prompt = \
"""
### Task
Generate a SQL query to answer [QUERY]{query}[/QUERY]
Only generate the SQL query.
If the question cannot be answered given the database schema, do not generate any SQL query.
The query will run on a database with the given schema.
ALWAYS use the rules below when generating the SQL query.

### Rules
1. When querying table with field(s) with date or timestamp type, always follow these rules:
- If the query doesn't mention any date or time scope, assume the query is for the last date in the table.
- Do not use CURRENT_DATE, use sub-query for the LAST DATE on the table instead, e.g., `SELECT MAX(table_alias.date_field) FROM the_table table_alias'
2. Unless mentioned in the query, always assume the query is asking for distinct values without data duplication.

### Example 1
[QUERY]How many products are available?[/QUERY]
[SCHEMA]CREATE TABLE INVENTORY_VIEW (id INT, product_name VARCHAR(50), qty DECIMAL(10,2));[/SCHEMA]
[SQL]SELECT SUM(qty) FROM INVENTORY_VIEW[/SQL]

### Example 2
[QUERY]What is the meaning of life?[/QUERY]
[SCHEMA]CREATE TABLE INVENTORY_VIEW (id INT, product_name VARCHAR(50), qty DECIMAL(10,2));[/SCHEMA]
[SQL][/SQL]

### Example 3
[QUERY]List customer with name begins with letter A.[/QUERY]
[SCHEMA]CREATE TABLE CUSTOMER_VIEW (id INT, name VARCHAR(50))[/SCHEMA]
[SQL]SELECT 'name' FROM CUSTOMER_VIEW WHERE LEFT(name, 1) = 'A'[/SQL]

### Example 4
[QUERY]Which customer bought the most?[/QUERY]
[SCHEMA]CREATE TABLE SALES_ORDER (order_no VARCHAR(50), customer_name VARCHAR(100), product_name VARCHAR(100), qty NUMERIC)[/SCHEMA]
[SQL]SELECT customer_name FROM SALES_ORDER GROUP BY customer_name ORDER BY SUM(qty) DESC LIMIT 1;[/SQL]

### Example 5
[QUERY]How many stock do we have?[/QUERY]
[SCHEMA]CREATE TABLE INVENTORY_VIEW (id INT, inventory_date DATE, product_name VARCHAR(50), qty DECIMAL(10,2));[/SCHEMA]
[SQL]SELECT SUM(iv.qty) FROM INVENTORY_VIEW iv WHERE inventory_date = (SELECT MAX(iv2.inventory_date) FROM INVENTORY_VIEW iv2 );[/SQL]

### Answer
[QUERY]{query}[/QUERY]
[SCHEMA]{schema}[/SCHEMA]
[SQL]
"""