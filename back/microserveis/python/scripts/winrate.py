import sys
import json
import matplotlib.pyplot as plt
import numpy as np

def main():
    if len(sys.argv) < 3:
        print("No s'han passat prou paràmetres")
        return

    partides_json = sys.argv[1]
    personatges_json = sys.argv[2]
    
    try:
        partides = json.loads(partides_json)
    except json.JSONDecodeError as e:
        print("Error al decodificar JSON de partides:", e)
        return
    
    try:
        personatges = json.loads(personatges_json)
    except json.JSONDecodeError as e:
        print("Error al decodificar JSON de personatges:", e)
        return

    # Crear un diccionari per relacionar ID amb noms de personatges
    personatge_noms = {p["idPersonatge"]: p["nom"] for p in personatges}

    # Comptar victòries i derrotes per personatge
    win_counts = {}
    total_counts = {}

    for partida in partides:
        guanyador = partida.get("idPersonatgeGuanyador")
        perdedor = partida.get("idPersonatgePerdedor")

        if guanyador is None or perdedor is None or guanyador not in personatge_noms or perdedor not in personatge_noms:
            print(f"AVÍS: Entrada amb personatge no vàlid detectada: {partida}")
            continue

        # Inicialitzar si no existeixen
        if guanyador not in win_counts:
            win_counts[guanyador] = 0
            total_counts[guanyador] = 0
        if perdedor not in total_counts:
            total_counts[perdedor] = 0

        # Sumar guanys i partides jugades
        win_counts[guanyador] += 1
        total_counts[guanyador] += 1
        total_counts[perdedor] += 1

    # Calcular el winrate i el lossrate
    winrates = {
        personatge: (win_counts.get(personatge, 0) / total_counts[personatge]) * 100
        for personatge in total_counts
    }

    lossrates = {
        personatge: 100 - winrates[personatge]  # Percentatge de derrotes
        for personatge in total_counts
    }

    # Si no hi ha dades, evitar errors
    if not winrates:
        print("No hi ha dades suficients per generar el gràfic.")
        return

    # Preparar dades per a matplotlib
    characters = [personatge_noms[personatge] for personatge in winrates.keys()]
    winrate_values = list(winrates.values())
    lossrate_values = list(lossrates.values())

    # Generar gràfic apilat
    fig, ax = plt.subplots(figsize=(10, 5))

    bar_width = 0.6  # Amplada de la barra
    indices = np.arange(len(characters))

    # Graficar winrate en blau i lossrate en vermell apilat a sobre
    ax.bar(indices, winrate_values, color='skyblue', label="Winrate (%)", width=bar_width)
    ax.bar(indices, lossrate_values, bottom=winrate_values, color='red', label="Lossrate (%)", width=bar_width)

    # for i in range(len(characters)):
    #     ax.text(
    #         x=indices[i], 
    #         y=winrate_values[i]/2,  
    #         s=f"{winrate_values[i]:.1f}%", 
    #         ha='center',
    #         va='center',
    #         color='black',
    #         fontweight='bold'
    #     )

    #     ax.text(
    #         x=indices[i], 
    #         y=winrate_values[i] + lossrate_values[i]/2, 
    #         s=f"{lossrate_values[i]:.1f}%", 
    #         ha='center',
    #         va='center',
    #         color='white',
    #         fontweight='bold'
    #     )

    # ax.set_xlabel("Personatge")

    ax.set_xlabel("Personatge")
    ax.set_ylabel("Percentatge (%)")
    ax.set_title("Winrate i Lossrate per Personatge")
    ax.set_xticks(indices)
    ax.set_xticklabels(characters, rotation=45, ha="right")
    ax.set_ylim(0, 100)
    ax.legend()

    # Guardar el gràfic
    plt.tight_layout()
    plt.savefig("microserveis/python/grafics/winrate.png")
    print("Gràfic guardat correctament!")

if __name__ == "__main__":
    main()
