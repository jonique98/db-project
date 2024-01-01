import React from 'react';
import List from './component/List.js';
import Search from './component/search.js';
import Statistics1 from './component/statistics1.js';
import Statistics2 from './component/statistics2.js';
import Statistics3 from './component/statistics3.js';
import MyChart from './component/MyChart.js';
import { MyChartProvider } from './component/MyChartContext.js';

import Search2 from './component/search2.js';

function Navbar() {
	return (
	<nav id = "navbar" class="navbar navbar-expand-lg">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">종합 차트</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#statistics">통계</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#search">검색</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#my-chart">나만의 차트</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
	);
}

function App() {
  return (
    <MyChartProvider>
      <div className="App">
        <Navbar />
        <h1 className="text-center" id="header">종합 차트</h1>
        <List />
        <div id="statistics" style={{ marginTop: '20px' }}>
          <div id="align-center" className="text-center">
            <div style={{ height: '200px', margin: '20px 0' }}></div>
            <Statistics1 key={1} statistics_name="많은 곡을 올린 가수" sw='1' />
            <Statistics2 key={2} statistics_name="가장 상승폭이 높은 곡" sw='2' />
            <Statistics3 key={3} statistics_name="차트 간 편차가 적은 곡" sw='3' />
          </div>
        </div>
        <div style={{ height: '150px', margin: '20px 0' }}></div>
        <MyChart />
        <div style={{ height: '80px', margin: '20px 0' }}></div>
        <h4 id = 'my-chart' className="text-center">아티스트 검색</h4>
        <Search />
        <div style={{ height: '150px', margin: '20px 0' }}></div>
        <h4 className="text-center">제목 검색</h4>
        <Search2 />
        <div style={{ height: '300px', margin: '20px 0' }}></div>
      </div>
    </MyChartProvider>
  );
}

export default App;