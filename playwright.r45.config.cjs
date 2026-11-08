const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests/browser',testMatch:['r45.spec.cjs'],timeout:30000,expect:{timeout:7000},workers:1,retries:0,
 outputDir:'test-results/r45',reporter:[['list'],['json',{outputFile:'test-results/r45/results.json'}]],
 use:{baseURL:process.env.R45_BASE_URL||'https://review.weplace.test',locale:'ko-KR',
 launchOptions:process.env.R45_CHROMIUM_PATH?{executablePath:process.env.R45_CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote']}:{},
 screenshot:'only-on-failure',trace:'retain-on-failure'},
 projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'mobile',use:{viewport:{width:390,height:900},isMobile:true,hasTouch:true,deviceScaleFactor:1}}]
});
