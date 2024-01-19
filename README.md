### Customer 모델에 대한 DDL:

```sql
CREATE TABLE IF NOT EXISTS Customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(255) NOT NULL,
    customer_grade VARCHAR(255) NOT NULL
);
```

### Order 모델에 대한 DDL:

```sql
CREATE TABLE IF NOT EXISTS Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    order_date DATE NOT NULL,
    order_type ENUM('order', 'refund') NOT NULL,
    order_amount DECIMAL(10, 2) NOT NULL,
    customer_id INT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);
```
