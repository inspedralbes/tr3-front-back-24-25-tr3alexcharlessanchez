import sys
import json
import matplotlib.pyplot as plt
import numpy as np

def main():
    if len(sys.argv) < 5:
        print("Falten paràmetres. Ús: script.py [json_powerups] [json_distancia] [json_bombes] [json_partides]")
        return

    powerUps_json = sys.argv[1]
    distancia_json = sys.argv[2]
    bombes_json = sys.argv[3]
    partides_json = sys.argv[4]

    try:
        powerups = json.loads(powerUps_json)
        distancia = json.loads(distancia_json)
        bombes = json.loads(bombes_json)
        partides = json.loads(partides_json)
    except json.JSONDecodeError as e:
        print("Error al decodificar els JSON:", e)
        return

    # Crear llistes de valors
    bombes_vals = [item["numeroBombes"] for item in bombes]
    powerups_vals = [item["powerups"] for item in powerups]
    distancia_vals = [item["distancia"] for item in distancia]
    duracio_vals = [item["duracio"] for item in partides]

    # Calcular les mitjanes per cada categoria
    mitjana_bombes = np.mean(bombes_vals) if bombes_vals else 0
    mitjana_powerups = np.mean(powerups_vals) if powerups_vals else 0
    mitjana_distancia = np.mean(distancia_vals) if distancia_vals else 0
    mitjana_duracio = np.mean(duracio_vals) if duracio_vals else 0

    def crear_grafic(titol, etiqueta, valor, color, fitxer, colorLletra):
        fig, ax = plt.subplots(figsize=(6, 4))
        barres = ax.bar([etiqueta], [valor], color=color)
        ax.set_xlabel(etiqueta)
        ax.set_ylabel('Mitjana')
        ax.set_title(titol)

        # Afegir el número dins de la barra
        for barra in barres:
            altura = barra.get_height()
            ax.text(barra.get_x() + barra.get_width()/2, altura/2, f'{altura:.2f}', 
                    ha='center', va='center', color=colorLletra, fontsize=12, fontweight='bold')

        try:
            plt.tight_layout()
            plt.savefig(f'microserveis/python/grafics/{fitxer}')
            print(f"Gràfic {titol} guardat correctament!")
        except Exception as e:
            print(f"Error en guardar el gràfic {titol}:", e)

    # Crear els gràfics
    crear_grafic('Mitjana de Bombes per Partida', 'Bombes', mitjana_bombes, 'blue', 'mitjanaBombes.png', 'white')
    crear_grafic('Mitjana de Powerups per Partida', 'Powerups', mitjana_powerups, 'green', 'mitjanaPowerups.png', 'white')
    crear_grafic('Mitjana de Distància per Partida', 'Distància', mitjana_distancia, 'orange', 'mitjanaDistancia.png', 'black')
    crear_grafic('Mitjana de Duració per Partida', 'Duració', mitjana_duracio, 'red', 'mitjanaDuracio.png', 'black')

if __name__ == "__main__":
    main()
