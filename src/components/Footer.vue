<template>
  <footer id="footer">
    <a href="https://dh.gu.se/">
      <div
        id="CDHLogo"
      >
        Centre<br /><span
          style="font-family: 'Clicker Script', cursive; font-size:30px;  vertical-align:40%;"
          >for </span
        >Digital <br />Humanities
      </div>
    </a>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data() {
  }
}
</script>

<style scoped>
#footer {
  background-color: #222;
  color: white;
  line-height: 1.3;
  height: 200px;
  width: 100%;
  font-size: 18px;
}

a {
  font-weight: bold;
}

#CDHLogo {
  float: right;
  margin-top: 0px;
  margin-right: 20px;
  width: auto;
  height: auto;
  text-align: left;
  font-weight: 100;
  font-style: normal;
  font-size: 50px;
  line-height: 0.8;
  padding: 30px 0px 10px 0px;
  vertical-align: middle;
  font-family: "Barlow Condensed", sans-serif;
}
</style>
