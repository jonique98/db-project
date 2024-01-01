import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import '../index.css';

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

export default Navbar;