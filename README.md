# DB-PROJECT

## 프로젝트 소개
3개의 음원차트, 지니, 벅스, 멜론은 서버 오픈 시간 기준으로 실시간 크롤링

3개의 테이블에서 적절히 가중치를 계산하여 종합 순위를 매긴 음원차트를 제공

<img src = https://github.com/jonique98/db-project/assets/104954561/8ce937b4-a1db-4123-82c8-653b97d41a4d />

<img src = https://github.com/jonique98/db-project/assets/104954561/4d131182-e9aa-4293-a44e-ee0d90d5db3a />

<img src = https://github.com/jonique98/db-project/assets/104954561/49620445-6317-4226-ac4b-51ed7137a460 />

<img src = https://github.com/jonique98/db-project/assets/104954561/94634156-f679-4ebc-980c-67bec276b626 />


## ERD
<img src = https://github.com/jonique98/db-project/assets/104954561/10ae05f4-11c0-45ab-8c40-a363a3e601e9 />


## 개발 환경
- Python 3.8.5(BeautifulSoup4)
- JavaScript ES6(Cheerio)
- Node.js Express
- Amazon RDS MySQL
- AWS Lambda

## 실행 방법
1. cd my-app
2. npm install
3. node server/server.js
4. localhost:3000 접속

## 비고
- 서버에서 데이터베이스 쿼리를 요청하고 이를 활용해 기본 기능이라고 할 수 있는 CRUD 구현에 집중
- 서버에서 할 수 있는 테이블 가공을 클라이언트에서 하는 경향이 있음
- 벅스는 자바스크립트 Cheerio 라이브러리로 크롤링이 되지 않아서 파이썬 BeautifulSoup4 라이브러리로 크롤링 후 Amazon Lambda로 서버리스 API로 사용
