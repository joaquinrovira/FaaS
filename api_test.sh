URL="localhost"

echo -e "\e[36m>\e[32m Add user:\e[0m"
curl -X POST $URL/u/user1

echo -e "\n\e[36m>\e[32m List user funtions:\e[0m"
curl $URL/u/user1/fn

echo -e "\n\e[36m>\e[32m Post function:\e[0m"
curl -X POST -d "function add(a,b){return a+b;}" $URL/u/user1/fn/add

echo -e "\n\e[36m>\e[32m List user funtions:\e[0m"
curl $URL/u/user1/fn

echo -e "\n\e[36m>\e[32m Execute function:\e[0m"
curl -X POST -d "[4,5]" $URL/u/user1/fn/add/run

echo -e "\n\e[36m>\e[32m Get job status:\e[0m"
JOB_ID=$(curl -s -X POST -d "[4,5]" $URL/u/user1/fn/add/run | python3 -c "import sys, json; print(json.load(sys.stdin)['res'])")
curl $URL/j/$JOB_ID

echo -e "\n\e[36m>\e[32m Get job result:\e[0m"
STATUS=$(curl -s $URL/j/$JOB_ID | python3 -c "import sys, json; print(json.load(sys.stdin)['res'])")
while [[ "$STATUS" == "0" ]]; do
    STATUS=$(curl -s $URL/j/$JOB_ID | python3 -c "import sys, json; print(json.load(sys.stdin)['res'])")
    sleep 1
done
curl $URL/j/$JOB_ID/res
echo -e "\n\e[36m>\e[32m Remove job:\e[0m"
curl -X DELETE $URL/j/$JOB_ID
echo -e "\n\e[36m>\e[32m Done."
