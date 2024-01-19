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

```
second
├─ .gitignore
├─ README.md
├─ app.js
├─ config
├─ controllers
│  ├─ customerController.js
│  ├─ monthly_SalesController.js
│  ├─ orderController.js
│  └─ uploadController.js
├─ database
│  ├─ db.js
│  └─ models
│     ├─ customer.js
│     ├─ index.js
│     └─ order.js
├─ migrations
├─ package-lock.json
├─ package.json
├─ routes
│  ├─ customer.js
│  ├─ monthly_sales.js
│  ├─ order.js
│  └─ upload.js
└─ seeders

```

### 프로젝트 설명

프로젝트는 사용자가 .xlsx 파일을 업로드하여 데이터베이스에 고객 및 주문 데이터를 추가하는 API와 월별 매출을 조회하는 API, 그리고 주문을 조회하는 API를 제공합니다.
이 프로젝트를 통해 사용자는 효율적으로 데이터를 관리하고, 월별 매출 동향을 파악하며, 주문 목록을 필요에 따라 필터링할 수 있습니다.

1.  **uploadFile**

    - **URL:** `/upload`
    - **Method:** POST
    - **Description:** .xlsx 파일을 읽어 고객 및 주문 데이터를 데이터베이스에 업로드합니다.
      파일은 서버로 `multipart/form-data` 형식으로 전송됩니다.

      **Request:**

      - 파일 필드: `file` (xlsx 파일)

      **Response:**

      - 성공 시: `200 OK` 및 "파일 업로드 및 데이터베이스에 데이터 삽입 완료." 메시지
      - 실패 시: `400 Bad Request` 및 "파일이 업로드되지 않았습니다." 또는 `500 Internal Server Error` 및 "내부 서버 오류" 메시지

    - **Example:**

      ```bash

      curl -X POST -F "file=@/path/to/your/file.xlsx" http://localhost:3000/upload

      ```

---

2. **getMonthlySales**

   - **URL:** `/monthly-sales`
   - **Method:** GET
   - **Description:**
     월별 매출 통계를 조회하는 API입니다. 주어진 기간 동안의 주문, 반품 및 매출을 표시합니다.

     **Response:**

     - 성공 시: 200 OK 및 월별 매출 통계 데이터
     - 실패 시: 500 Internal Server Error 및 "서버 오류" 메시지

   - **Example:**

     ```bash

     curl http://localhost:3000/monthly-salesocalhost:3000/upload

     ```

     ![Postman요청결과](/img/projectImg1.png)

---

3. **getOrders**

   - **URL:** `/orders`
   - **Method:** GET
   - **Description:**
   - **Query Parameters:**

     - startDate (string): 기간 조회 시 시작일
     - endDate (string): 기간 조회 시 종료일
     - orderType (number): 주문 또는 반품만을 조회 (0: 주문, 1: 반품)
     - customerId (number): 특정 고객의 주문만 조회 시, 고객 ID
     - pageSize (number): 페이지네이션 - 한 페이지 조회 건 수
     - pageNo (number): 페이지네이션 - 조회할 페이지 번호

     **Response:**

     - 성공 시: 200 OK 및 주문 목록 데이터
     - 실패 시: 500 Internal Server Error 및 "내부 서버 오류" 메시지

   - **Example:**

     ```bash

     curl http://localhost:3000/orders?startDate=2023-01-01&endDate=2023-01-31&orderType=0&customerId=18&pageSize=50&pageNo=1

     ```

     ![Postman요청결과](/img/projectImg2.png)

---
