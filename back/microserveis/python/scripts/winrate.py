import sys
import json

def main():
    if len(sys.argv) < 2:
        print("No s'ha passat cap paràmetre")
        return

    # Recuperar la cadena JSON passada com a argument
    jugadors_json = sys.argv[1]
    
    # Convertir la cadena JSON a un objecte Python
    try:
        jugadors = json.loads(jugadors_json)
    except json.JSONDecodeError as e:
        print("Error al decodificar JSON:", e)
        return

    # Ara pots processar els jugadors, per exemple, imprimir-los
    print("Jugadors rebuts:")
    for jugador in jugadors:
        print(jugador)

if __name__ == "__main__":
    main()