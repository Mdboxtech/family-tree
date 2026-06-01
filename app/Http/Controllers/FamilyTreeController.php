<?php

namespace App\Http\Controllers;

use App\Services\FamilyTreeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class FamilyTreeController extends Controller
{
    public function __construct(
        private readonly FamilyTreeService $treeService
    ) {}

    /**
     * Show the interactive family tree page.
     */
    public function index(): Response|\Illuminate\Http\RedirectResponse
    {
        $privacyMode = \App\Models\Setting::where('key', 'privacy_mode')->value('value') === '1';
        
        if ($privacyMode && !\Illuminate\Support\Facades\Auth::check()) {
            return redirect()->route('login');
        }

        return Inertia::render('Home');
    }

    private function checkPrivacyMode(): ?JsonResponse
    {
        $privacyMode = \App\Models\Setting::where('key', 'privacy_mode')->value('value') === '1';
        if ($privacyMode && !\Illuminate\Support\Facades\Auth::check()) {
            return response()->json(['error' => 'Unauthorized. Privacy mode is active.'], 401);
        }
        return null;
    }

    /**
     * Return full tree data JSON for D3.
     */
    public function treeData(): JsonResponse
    {
        if ($err = $this->checkPrivacyMode()) return $err;

        $data = Cache::remember('family_tree_data', now()->addMinutes(5), function () {
            return $this->treeService->getTreeData();
        });

        return response()->json($data);
    }

    /**
     * Return hierarchy tree data JSON for D3 tree layout.
     */
    public function hierarchyData(\Illuminate\Http\Request $request): JsonResponse
    {
        if ($err = $this->checkPrivacyMode()) return $err;

        $rootId = $request->query('root_id');
        
        $data = $this->treeService->buildHierarchyTree($rootId ? (int)$rootId : null);

        return response()->json($data);
    }

    /**
     * Return member + direct relatives JSON.
     */
    public function memberRelatives(int $id): JsonResponse
    {
        if ($err = $this->checkPrivacyMode()) return $err;

        $data = $this->treeService->getMemberWithRelatives($id);
        return response()->json($data);
    }
}
