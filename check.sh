#!/bin/bash
FILE="$HOME/AIEP/index.html"
echo "============================="
echo "  AIEP Code Health Check"
echo "============================="

echo ""
echo "📁 File Info:"
echo "   Size: $(ls -lh $FILE | awk '{print $5}')"
echo "   Lines: $(wc -l < $FILE)"

echo ""
echo "🔑 App ID:"
APPID=$(grep -oP 'APP_ID = "[^"]+' $FILE | sed 's/APP_ID = "//')
if [ "$APPID" = "YOUR_APP_ID" ]; then
    echo "   ❌ NOT SET (still shows YOUR_APP_ID)"
else
    echo "   ✅ Set to: ${APPID:0:20}..."
fi

echo ""
echo "📦 InstantDB CDN:"
if grep -q "instantdb" $FILE; then
    HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://cdn.jsdelivr.net/npm/@instantdb/core@0.14.31/dist/index.umd.js)
    if [ "$HTTP" = "200" ]; then
        echo "   ✅ Found and CDN reachable (HTTP $HTTP)"
    else
        echo "   ⚠️  Found but CDN returned HTTP $HTTP"
    fi
else
    echo "   ❌ Not found in code"
fi

echo ""
echo "📄 Sections:"
for V in V_HOME V_AUTH V_PRICING V_ADMIN V_EXAM V_RESULT V_PRIVACY V_TERMS V_DISCLAIMER V_ABOUT V_ADMLOGIN; do
    if grep -q "id=\"$V\"" $FILE; then
        echo "   ✅ $V"
    else
        echo "   ❌ $V MISSING"
    fi
done

echo ""
echo "📝 Exam Count:"
echo "   $(grep -oP '[a-z0-9]+:\{name:"' $FILE | wc -l) exams defined"

echo ""
echo "🔧 JavaScript:"
TMPJS=$(mktemp)
sed -n '/<script>/,/<\/script>/p' $FILE | sed '1d;$d' > $TMPJS
ERR=$(node --check $TMPJS 2>&1)
if [ -z "$ERR" ]; then
    echo "   ✅ No syntax errors"
else
    echo "   ❌ Syntax error:"
    echo "   $ERR"
fi
rm -f $TMPJS

echo ""
echo "📊 Tag Balance:"
DIV_O=$(grep -o '<div' $FILE | wc -l)
DIV_C=$(grep -o '</div>' $FILE | wc -l)
if [ "$DIV_O" -eq "$DIV_C" ]; then
    echo "   ✅ div tags balanced ($DIV_O open, $DIV_C close)"
else
    echo "   ⚠️  div mismatch ($DIV_O open, $DIV_C close)"
fi

echo ""
echo "🌐 Deploy Commands:"
echo "   cd ~/AIEP"
echo "   git add . && git commit -m 'update' && git push"
echo ""
echo "============================="
