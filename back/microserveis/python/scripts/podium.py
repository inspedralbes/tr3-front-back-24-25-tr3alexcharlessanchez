import sys
import json
import matplotlib.pyplot as plt

def main():
    if len(sys.argv) < 2:
        print("Falten paràmetres. Ús: script.py [json_usuaris]")
        return

    usuaris_json = sys.argv[1]

    try:
        usuaris = json.loads(usuaris_json)
    except json.JSONDecodeError as e:
        print("Error al decodificar JSON d'usuaris:", e)
        return

    # Ordenar usuaris per victòries (descendent) i seleccionar top 3
    usuaris_ordenats = sorted(usuaris, key=lambda x: x['victories'], reverse=True)[:3]

    # Preparar dades per al gràfic
    noms = [u['nom'] for u in usuaris_ordenats]
    victories = [u['victories'] for u in usuaris_ordenats]
    colors = ['#FFD700', '#C0C0C0', '#CD7F32']  # Or, plata, bronze

    # Crear el gràfic
    fig, ax = plt.subplots(figsize=(10, 6))
    
    bars = ax.bar(noms, victories, color=colors[:len(usuaris_ordenats)])
    
    # Configuració estètica
    ax.set_title('Top 3 Jugadors per Victòries')
    ax.set_ylabel('Nombre de Victòries')
    ax.set_xlabel('Jugador')
    
    # Afegir valors a les barres
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom',
                fontsize=12, fontweight='bold')
    
    # Ajustar espais i guardar
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    
    try:
        plt.savefig('microserveis/python/grafics/podium.png')
        print("Gràfic de podi guardat correctament!")
    except Exception as e:
        print("Error en guardar el gràfic:", e)

if __name__ == "__main__":
    main()