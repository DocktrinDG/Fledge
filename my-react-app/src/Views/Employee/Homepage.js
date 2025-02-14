
import '../css/Homepage.css';
const Homepage = () => {
  	return (
    		<div className="homepage">
      			<div className="top-bar">
        				<div className="top-bar-child" />
        				<div className="title">Employee Training Dashboard</div>
        				<div className="navigation">
          					<div className="textfield">
            						<div className="text">Search in site</div>
            						<img className="ic-search-icon" alt="" src="ic-search.svg" />
          					</div>
        				</div>
      			</div>
      			<div className="sidebar">
        				<div className="item">
          					<div className="frame">
            						<div className="icon">😊</div>
          					</div>
          					<div className="title1">Dashboard</div>
        				</div>
        				<div className="item">
          					<div className="frame">
            						<div className="icon">📊</div>
          					</div>
          					<div className="title1">Analytics</div>
        				</div>
        				<div className="item">
          					<div className="frame">
            						<div className="icon">🔍</div>
          					</div>
          					<div className="title1">{`Search & Filters`}</div>
        				</div>
        				<div className="item">
          					<div className="frame">
            						<div className="icon">📚</div>
          					</div>
          					<div className="title1">Training Management</div>
        				</div>
        				<div className="item">
          					<div className="frame">
            						<div className="icon">📝</div>
          					</div>
          					<div className="title1">Feedback Forms</div>
        				</div>
      			</div>
      			<div className="section">
        				<div className="avatar" />
        				<div className="container">
          					<b className="title6">Employee Profiles</b>
          					<div className="selection">
            						<div className="label-normal">
              							<div className="label-text">Certifications</div>
            						</div>
            						<div className="label-normal">
              							<div className="label-text">Training Progress</div>
            						</div>
            						<div className="label-normal">
              							<div className="label-text">Skill Growth</div>
            						</div>
          					</div>
          					<div className="description">View and manage employee profiles with training progress and skill growth.</div>
        				</div>
        				<img className="section-child" alt="" src="Vector 200.svg" />
      			</div>
      			<div className="data-metrics">
        				<div className="container1">
          					<div className="container2">
            						<b className="title7">Training Insights</b>
            						<div className="description1">Analytics for training data</div>
          					</div>
        				</div>
        				<div className="list">
          					<div className="row">
            						<div className="metric">
              							<div className="title8">Completed Trainings</div>
              							<div className="data">120</div>
              							<div className="change">+15%</div>
            						</div>
            						<div className="metric">
              							<div className="title8">In Progress Trainings</div>
              							<div className="data">40</div>
              							<div className="change">-10%</div>
            						</div>
            						<div className="metric">
              							<div className="title8">Skills Development</div>
              							<div className="data">85%</div>
              							<div className="change">+5%</div>
            						</div>
          					</div>
        				</div>
        				<div className="container3">
          					<div className="container4">
            						<div className="title11">Training Analysis</div>
            						<div className="y-axis">Progress Percentage</div>
            						<img className="graph-icon" alt="" src="graph.svg" />
            						<div className="x-axis">Training Modules</div>
          					</div>
        				</div>
        				<img className="data-metrics-child" alt="" src="Vector 200.svg" />
      			</div>
      			<div className="list1">
        				<div className="container5">
          					<b className="title7">Employee Directory</b>
          					<div className="description1">Find employees by skills, training, or department</div>
        				</div>
        				<div className="list2">
          					<div className="row1">
            						<div className="item5">
              							<div className="frame5">
                								<div className="icon5">👤</div>
              							</div>
              							<div className="title-parent">
                								<div className="title13">Employee 1</div>
                								<div className="subtitle">Skills: Java, SQL</div>
              							</div>
              							<div className="subtitle1">IT Department</div>
            						</div>
            						<div className="item5">
              							<div className="frame5">
                								<div className="icon5">👩‍💼</div>
              							</div>
              							<div className="title-parent">
                								<div className="title13">Employee 2</div>
                								<div className="subtitle">Skills: Marketing, Adobe Suite</div>
              							</div>
              							<div className="subtitle1">Marketing Department</div>
            						</div>
            						<div className="item5">
              							<div className="frame5">
                								<div className="icon5">🧑‍🏫</div>
              							</div>
              							<div className="title-parent">
                								<div className="title13">Employee 3</div>
                								<div className="subtitle">Skills: Training Coordination</div>
              							</div>
              							<div className="subtitle1">HR Department</div>
            						</div>
          					</div>
        				</div>
        				<img className="section-child" alt="" src="Vector 200.svg" />
      			</div>
      			<div className="form">
        				<div className="container6">
          					<div className="image-container">
            						<div className="image" />
          					</div>
          					<div className="title-wrapper">
            						<b className="title16">Request Training</b>
          					</div>
        				</div>
        				<div className="list3">
          					<div className="row2">
            						<div className="input">
              							<div className="title17">Training Name</div>
              							<div className="textfield1">
                								<div className="text1">Enter training name</div>
              							</div>
              							<div className="info">Provide as specific as possible</div>
            						</div>
            						<div className="input1">
              							<div className="title18">Requested By</div>
              							<div className="textfield2">
                								<div className="text1">Your Name</div>
              							</div>
            						</div>
          					</div>
          					<div className="button">
            						<div className="primary">
              							<div className="title19">Submit</div>
            						</div>
          					</div>
        				</div>
        				<img className="section-child" alt="" src="Vector 200.svg" />
      			</div>
      			<div className="section1">
        				<div className="map-container">
          					<div className="image1">
            						<div className="title20">Stay informed and skilled with our training program</div>
            						<div className="pagination">
              							<div className="pagination-child" />
              							<div className="pagination-item" />
              							<div className="pagination-item" />
              							<div className="pagination-item" />
            						</div>
          					</div>
        				</div>
        				<img className="section-item" alt="" src="Vector 200.svg" />
      			</div>
      			<div className="section2">
        				<div className="map-container">
          					<div className="image2">
            						<img className="image-icon" alt="" src="image.svg" />
            						<div className="title21">Interactive map for training locations and schedules</div>
            						<img className="ic-location-icon" alt="" src="ic-location.svg" />
          					</div>
        				</div>
        				<img className="section-item" alt="" src="Vector 200.svg" />
      			</div>
      			<div className="reviews">
        				<div className="container8">
          					<b className="title16">Feedback Forms</b>
          					<div className="description">Auto-generated feedback forms after training</div>
        				</div>
        				<div className="list4">
          					<div className="row1">
            						<div className="card">
              							<div className="user">
                								<div className="avatar1">
                  									<div className="avatar2" />
                  									<div className="title-wrapper">
                    										<div className="title23">Employee 1</div>
                  									</div>
                								</div>
                								<img className="user-child" alt="" src="Frame 427318817.svg" />
              							</div>
              							<div className="title24">Great training experience</div>
            						</div>
            						<div className="card">
              							<div className="user">
                								<div className="avatar1">
                  									<div className="avatar2" />
                  									<div className="title-wrapper">
                    										<div className="title23">Employee 2</div>
                  									</div>
                								</div>
                								<img className="user-child" alt="" src="Frame 427318817.svg" />
              							</div>
              							<div className="title24">Useful content and engaging trainers</div>
            						</div>
          					</div>
        				</div>
        				<img className="section-child" alt="" src="Vector 200.svg" />
      			</div>
      			<div className="section3">
        				<div className="container9">
          					<div className="title27">© 2023 Company Name. All rights reserved.</div>
          					<div className="title28">Privacy Policy | Terms of Service</div>
        				</div>
      			</div>
    		</div>);
};

export default Homepage;
