// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RestaurantList({ restaurants, onRestaurantClick, emptyMessage = "Žádné restaurace neodpovídají vašemu vyhledávání.", todayMealsMap = {} }: { restaurants: any[], onRestaurantClick: (r: any) => void, emptyMessage?: string, todayMealsMap?: Record<number, any[]> }) {
  return (
    <div className="w-full h-full bg-neutral-950 p-6 pt-52 md:pt-32 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Nalezené restaurace ({restaurants.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(r => (
            <div 
              key={r.restaurant_id} 
              className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:bg-neutral-800 transition-all group"
              onClick={() => onRestaurantClick(r)}
            >
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{r.name}</h3>
              <p className="text-neutral-400 text-sm mt-2">{r.address || "Adresa neznámá"}</p>
              
              {/* Zobrazení dnešních jídel přímo na kartě */}
              {todayMealsMap[r.restaurant_id] && todayMealsMap[r.restaurant_id].length > 0 && (
                <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                  {todayMealsMap[r.restaurant_id].slice(0, 3).map((meal, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-neutral-300 truncate pr-2">{meal.name}</span>
                      <span className="text-emerald-400 font-medium whitespace-nowrap">{meal.price} Kč</span>
                    </div>
                  ))}
                  {todayMealsMap[r.restaurant_id].length > 3 && (
                    <p className="text-xs text-neutral-500 italic mt-2">
                      a další {todayMealsMap[r.restaurant_id].length - 3}...
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
          {restaurants.length === 0 && (
            <div className="col-span-full py-20 text-center text-neutral-500">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
