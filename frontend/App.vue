<template>
  <div>
    <header>
      <!-- Fixed navbar -->
      <nav class="navbar navbar-expand-md navbar-dark bg-light fixed-top justify-content-between flex-nowrap flex-row"
           style="background-color: #201C50 !important">
        <a class="navbar-brand" href="/">VIEW</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse"
                aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse show" id="navbarCollapse">
          <ul class="navbar-nav mr-auto flex-row">
            <li class="nav-item active">
              <router-link class="nav-link" :to="{name:'home'}">avaleht</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{name:'upload'}">üleslaadimised</router-link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
</script>

<style>
  .bg-light {
    background-color: #201C50;
  }

  main {
    padding-top: 70px;
  }
</style>