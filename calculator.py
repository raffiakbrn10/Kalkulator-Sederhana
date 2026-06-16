from flask import Flask, request, jsonify
from flask_cors import CORS  # Penting agar JS Frontend bisa mengakses API ini

app = Flask(__name__)
CORS(app)  # Mengaktifkan Cross-Origin Resource Sharing

def tokenize_expression(expr_str):
    expr_str = expr_str.replace("×", "*").replace("÷", "/")
    raw_tokens = expr_str.split()
    tokens = []
    for item in raw_tokens:
        if item in ["+", "-", "*", "/"]:
            tokens.append(item)
        else:
            try:
                tokens.append(float(item))
            except ValueError:
                return None
    return tokens

def execute_parse(tokens):
    if not tokens: return 0
    # Pass 1: Perkalian & Pembagian
    higher_priority_stack = []
    idx = 0
    while idx < len(tokens):
        token = tokens[idx]
        if token in ["*", "/"]:
            prev_val = higher_priority_stack.pop()
            next_val = tokens[idx + 1]
            if token == "/" and next_val == 0:
                raise ZeroDivisionError()
            res = prev_val * next_val if token == "*" else prev_val / next_val
            higher_priority_stack.append(res)
            idx += 1
        else:
            higher_priority_stack.append(token)
        idx += 1

    # Pass 2: Penjumlahan & Pengurangan
    total = higher_priority_stack[0]
    idx = 1
    while idx < len(higher_priority_stack):
        op = higher_priority_stack[idx]
        next_val = higher_priority_stack[idx + 1]
        if op == "+": total += next_val
        elif op == "-": total -= next_val
        idx += 2
    return total

def calculate(expr_str):
    try:
        tokens = tokenize_expression(expr_str)
        if tokens is None: return "Error"
        output = execute_parse(tokens)
        if isinstance(output, float) and output.is_integer():
            return str(int(output))
        return str(round(output, 8))
    except ZeroDivisionError:
        return "Error: Pembagian Nol"
    except Exception:
        return "Error"

# Membuat Endpoint API POST /calculate
@app.route('/calculate', methods=['POST'])
def api_calculate():
    data = request.get_json()  # Mengambil data JSON dari Frontend
    expression = data.get('expression', '')
    
    result = calculate(expression)  # Hitung menggunakan logika Python
    
    return jsonify({'result': result})  # Kirim balik hasil ke Frontend

if __name__ == '__main__':
    # Berjalan di port 5000 untuk pengetesan lokal
    app.run(host='0.0.0.0', port=5000, debug=True)